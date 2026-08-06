import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bookmark, ChevronLeft, Download, Edit3, Heart, Loader2, Lock, MessageSquare, Reply, Send, Star, Trash2, Unlock } from 'lucide-react';
import { ResourceItem } from './ResourceCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ResourceComment, ResourceService, RatingSummary } from '../../services/resourceService';
import { supabaseClient } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface Props { resource: ResourceItem | null; onClose: () => void; isBookmarked?: boolean; onBookmarkToggle?: (id: string) => void; }

export const ResourceDetailsModal: React.FC<Props> = ({ resource, onClose, isBookmarked = false, onBookmarkToggle }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [detail, setDetail] = useState<any>(null);
  const [ratings, setRatings] = useState<RatingSummary | null>(null);
  const [comments, setComments] = useState<ResourceComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [interactionError, setInteractionError] = useState('');
  const [interactionSchemaReady, setInteractionSchemaReady] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<ResourceComment | null>(null);
  const [locked, setLocked] = useState(false);
  const [interactionsAvailable, setInteractionsAvailable] = useState(true);

  const isModerator = !!user && ['SUPER_ADMIN', 'ADMINISTRATOR', 'MODERATOR'].includes(user.role as string);
  const id = resource?.id;
  const load = useCallback(async (quiet = false) => {
    if (!id) return;
    if (!quiet) setLoading(true);
    try {
      if (quiet) {
        const [ratingData, commentData] = await Promise.all([ResourceService.getRatings(id), ResourceService.getComments(id)]);
        setRatings(ratingData); setComments(commentData); setError('');
        return;
      }
      const resourceDetail = await ResourceService.getResource(id);
      setDetail(resourceDetail);
      if (resourceDetail.status !== 'APPROVED') {
        setRatings(null); setComments([]); setInteractionsAvailable(false); setError('');
        return;
      }
      const [ratingResult, commentResult] = await Promise.allSettled([
        ResourceService.getRatings(id), ResourceService.getComments(id)
      ]);
      if (ratingResult.status === 'fulfilled') setRatings(ratingResult.value);
      if (commentResult.status === 'fulfilled') setComments(commentResult.value);
      if (ratingResult.status === 'rejected' || commentResult.status === 'rejected') {
        setInteractionError('Resource interactions need the Supabase database migration before they can be used.');
        setInteractionSchemaReady(false);
      } else {
        setInteractionError('');
        setInteractionSchemaReady(true);
      }
      setLocked(!!resourceDetail.commentsLocked); setInteractionsAvailable(true); setError('');
    } catch (err: any) { setError(err?.response?.data?.message || 'Could not load resource interactions.'); }
    finally { if (!quiet) setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!id || !interactionsAvailable || !interactionSchemaReady || detail?.status !== 'APPROVED') return;
    const channel = supabaseClient.channel(`resource-interactions-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resource_ratings', filter: `resource_id=eq.${id}` }, () => load(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resource_comments', filter: `resource_id=eq.${id}` }, () => load(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_likes' }, () => load(true)).subscribe();
    return () => { supabaseClient.removeChannel(channel); };
  }, [id, load, interactionsAvailable, interactionSchemaReady, detail?.status]);

  const children = useMemo(() => {
    const map = new Map<string | null, ResourceComment[]>();
    comments.forEach((comment) => map.set(comment.parentCommentId, [...(map.get(comment.parentCommentId) || []), comment]));
    return map;
  }, [comments]);

  if (!resource) return null;
  const current = detail || resource;
  const ownRating = ratings?.ratings.find((item) => item.user_id === user?.id) || null;

  const rate = async (value: number) => {
    if (!user) return showError('Sign in required', 'Sign in to rate this resource.');
    setSaving(true);
    try { await ResourceService.rateResource(resource.id, value, ownRating?.id); await load(true); showSuccess('Rating saved', `You rated this resource ${value} star${value === 1 ? '' : 's'}.`); }
    catch (err: any) { showError('Rating failed', err?.response?.data?.message || 'Could not save rating.'); }
    finally { setSaving(false); }
  };

  const removeRating = async () => {
    if (!ownRating) return;
    setSaving(true);
    try { await ResourceService.deleteRating(ownRating.id); await load(true); showSuccess('Rating removed', 'Your rating was deleted.'); }
    catch (err: any) { showError('Delete failed', err?.response?.data?.message || 'Could not delete rating.'); }
    finally { setSaving(false); }
  };

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = commentText.trim();
    if (!content || !user) return;
    setSaving(true);
    try {
      if (editing) await ResourceService.updateComment(editing.id, content);
      else await ResourceService.addComment(resource.id, content, replyTo || undefined);
      setCommentText(''); setReplyTo(null); setEditing(null); await load(true);
      showSuccess(editing ? 'Comment updated' : 'Comment posted', 'Your changes are live.');
    } catch (err: any) { showError('Comment failed', err?.response?.data?.message || 'Could not save comment.'); }
    finally { setSaving(false); }
  };

  const removeComment = async (comment: ResourceComment) => {
    if (!window.confirm('Delete this comment?')) return;
    try { await ResourceService.deleteComment(comment.id); await load(true); showSuccess('Comment deleted', 'The comment was removed.'); }
    catch (err: any) { showError('Delete failed', err?.response?.data?.message || 'Could not delete comment.'); }
  };

  const toggleLike = async (comment: ResourceComment) => {
    if (!user) return showError('Sign in required', 'Sign in to like comments.');
    try { await ResourceService.toggleCommentLike(comment.id); await load(true); }
    catch (err: any) { showError('Like failed', err?.response?.data?.message || 'Could not update like.'); }
  };

  const toggleLock = async () => {
    try { const result = await ResourceService.lockComments(resource.id, !locked); setLocked(result.locked); showSuccess(result.locked ? 'Comments locked' : 'Comments unlocked', 'Moderation setting updated.'); }
    catch (err: any) { showError('Update failed', err?.response?.data?.message || 'Could not change comment lock.'); }
  };

  const download = async () => {
    if (!user) {
      showInfo('Sign In Required', 'Please sign in to download academic resources.');
      onClose();
      navigate('/login', { state: { from: { pathname: location.pathname } } });
      return;
    }
    try { const data = await ResourceService.downloadResource(resource.id); window.open(data.downloadUrl, '_blank', 'noopener,noreferrer'); }
    catch (err: any) { showError('Download failed', err?.response?.data?.message || 'Could not prepare the download.'); }
  };

  const renderComments = (parentId: string | null, depth = 1): React.ReactNode => (children.get(parentId) || []).map((comment) => {
    const canModify = user?.id === comment.userId || isModerator;
    return <div key={comment.id} className={`${depth > 1 ? 'ml-5 sm:ml-9 border-l-2 border-blue-100 dark:border-zinc-800 pl-3' : ''} space-y-2`}>
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {comment.author?.avatar_url ? <img src={comment.author.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" /> : <div className="w-7 h-7 rounded-full bg-blue-600 text-white grid place-items-center font-bold">{comment.author?.full_name?.[0] || 'U'}</div>}
            <span className="font-extrabold truncate">{comment.author?.full_name || 'Anonymous'}</span>
            <span className="text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
            {comment.updatedAt !== comment.createdAt && <span className="text-slate-400">(edited)</span>}
          </div>
          {canModify && <div className="flex gap-2">
            {user?.id === comment.userId && <button onClick={() => { setEditing(comment); setReplyTo(null); setCommentText(comment.content); }} aria-label="Edit comment"><Edit3 className="w-3.5 h-3.5" /></button>}
            <button onClick={() => removeComment(comment)} aria-label="Delete comment"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
          </div>}
        </div>
        <p className="mt-2 text-slate-700 dark:text-zinc-200 whitespace-pre-wrap">{comment.content}</p>
        <div className="flex gap-4 mt-2 text-slate-500">
          <button onClick={() => toggleLike(comment)} className={`flex items-center gap-1 ${comment.isLikedByCurrentUser ? 'text-red-500' : ''}`}><Heart className={`w-3.5 h-3.5 ${comment.isLikedByCurrentUser ? 'fill-current' : ''}`} />{comment.likesCount}</button>
          {depth < 3 && user && !locked && <button onClick={() => { setReplyTo(comment.id); setEditing(null); setCommentText(''); }} className="flex items-center gap-1"><Reply className="w-3.5 h-3.5" />Reply</button>}
        </div>
      </div>
      {renderComments(comment.id, depth + 1)}
    </div>;
  });

  return <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
    <div className="w-full max-w-5xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-zinc-100">
      <div className="p-4 sm:px-6 border-b border-slate-300 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900">
        <button onClick={onClose} className="flex items-center gap-2 text-xs font-extrabold"><ChevronLeft className="w-4 h-4" />Back to Resources</button>
        <div className="flex gap-2">
          {isModerator && <button onClick={toggleLock} className="p-2 rounded-full border border-slate-300 dark:border-zinc-700" title={locked ? 'Unlock comments' : 'Lock comments'}>{locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</button>}
          <button onClick={() => onBookmarkToggle?.(resource.id)} className={`p-2 rounded-full border ${isBookmarked ? 'bg-blue-600 text-white' : 'border-slate-300 dark:border-zinc-700'}`}><Bookmark className="w-4 h-4" /></button>
          <Button size="sm" onClick={download} leftIcon={<Download className="w-4 h-4" />}>Download</Button>
        </div>
      </div>
      <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
        {loading ? <div className="py-20 flex justify-center gap-2 text-blue-600"><Loader2 className="animate-spin" />Loading resource...</div> : error ? <div className="p-4 bg-red-50 text-red-700 rounded-2xl">{error}<button onClick={() => load()} className="ml-3 underline">Retry</button></div> : <>
          <div className="space-y-3 border-b border-slate-200 dark:border-zinc-800 pb-5">
            <div className="flex gap-2"><Badge variant="blue">{current.categoryName || resource.category}</Badge><span className="text-xs font-bold">{current.departmentName || resource.department} · {current.semesterName || resource.semester}</span></div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{current.title}</h1>
            <p className="text-xs">Uploaded by <strong>{current.uploaderName || resource.uploaderName}</strong> · {current.courseTitle || resource.course}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3 text-center"><strong className="text-amber-600">★ {(ratings?.averageRating || 0).toFixed(1)} ({ratings?.ratingCount || 0})</strong><p className="text-[10px]">Rating</p></Card>
            <Card className="p-3 text-center"><strong>{current.downloadsCount || 0}</strong><p className="text-[10px]">Downloads</p></Card>
            <Card className="p-3 text-center"><strong>{comments.length}</strong><p className="text-[10px]">Comments</p></Card>
            <Card className="p-3 text-center"><strong>{current.fileSizeFormatted || resource.fileSize || '—'}</strong><p className="text-[10px]">File size</p></Card>
          </div>
          <div><h3 className="text-sm font-black mb-2">Description</h3><p className="text-xs bg-slate-100 dark:bg-zinc-900 p-4 rounded-2xl whitespace-pre-wrap">{current.description}</p></div>
          {!!current.tags?.length && <div className="flex gap-2 flex-wrap">{current.tags.map((tag: string) => <Badge key={tag}>#{tag}</Badge>)}</div>}
          {interactionsAvailable ? <>{interactionError && <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold">{interactionError}</div>}{interactionSchemaReady && <><div className="border-t border-slate-200 dark:border-zinc-800 pt-5">
            <h3 className="text-sm font-black mb-2">Rate this resource</h3>
            <div className="flex items-center gap-1">{[1,2,3,4,5].map((value) => <button key={value} disabled={saving} onClick={() => rate(value)} aria-label={`${value} stars`}><Star className={`w-6 h-6 ${value <= (ownRating?.rating || 0) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} /></button>)}{ownRating && <button onClick={removeRating} className="ml-3 text-xs text-red-600">Remove</button>}</div>
          </div>
          <div className="border-t border-slate-200 dark:border-zinc-800 pt-5 space-y-4">
            <div className="flex justify-between"><h3 className="text-sm font-black flex gap-2"><MessageSquare className="w-4 h-4" />Discussion ({comments.length})</h3>{locked && <span className="text-xs text-amber-600">Comments locked</span>}</div>
            {user && !locked ? <form onSubmit={submitComment} className="space-y-2"><div className="text-[11px] text-blue-600">{editing ? 'Editing comment' : replyTo ? 'Writing a reply' : 'Add a comment'} {(editing || replyTo) && <button type="button" className="underline ml-2" onClick={() => { setEditing(null); setReplyTo(null); setCommentText(''); }}>Cancel</button>}</div><div className="flex gap-2"><textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} maxLength={2000} required className="flex-1 min-h-20 bg-slate-50 dark:bg-zinc-900 border rounded-xl p-3 text-xs" placeholder="Write a comment..." /><Button type="submit" disabled={saving || !commentText.trim()} leftIcon={<Send className="w-4 h-4" />}>Post</Button></div></form> : !user ? <p className="text-xs text-slate-500">Sign in to join the discussion.</p> : null}
            {comments.length ? <div className="space-y-3">{renderComments(null)}</div> : <p className="text-center py-8 text-xs text-slate-500">No comments yet. Start the discussion.</p>}
          </div>
          </>}</> : <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold">Ratings and comments become available after this resource is approved.</div>}
          <div className="border-t border-slate-200 dark:border-zinc-800 pt-5"><h3 className="text-sm font-black mb-2">Related Resources</h3>{current.relatedResources?.length ? <div className="grid sm:grid-cols-2 gap-2">{current.relatedResources.map((related: any) => <div key={related.id} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs"><strong>{related.title}</strong><span className="block mt-1 text-amber-600">★ {related.averageRating.toFixed(1)} ({related.ratingCount})</span></div>)}</div> : <p className="text-xs text-slate-500">No related approved resources yet.</p>}</div>
        </>}
      </div>
    </div>
  </div>;
};

export default ResourceDetailsModal;

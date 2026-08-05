import app from './app';
import { env } from './config/env';
import { BootstrapService } from './services/bootstrap.service';

const PORT = env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 CampusArchive Express API Engine Live on Port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);

  // Run First Admin Bootstrap check
  await BootstrapService.runBootstrap();
});

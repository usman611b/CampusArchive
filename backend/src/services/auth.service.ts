import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { env } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from '../validators/auth.validator';
import { UserMapper, UserResponseDto } from '../dtos/user.dto';

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user: UserResponseDto; token: string }> {
    const existingEmail = await UserRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new Error('EMAIL_EXISTS: An account with this email already exists.');
    }

    const existingUsername = await UserRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new Error('USERNAME_EXISTS: This username is already taken.');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const newUserRow = await UserRepository.createUser({
      ...input,
      role: 'STUDENT',
      passwordHash
    });

    const token = this.generateToken(newUserRow.id, newUserRow.role, newUserRow.password_hash);
    const userDto = UserMapper.toDto(newUserRow, 0);

    return { user: userDto, token };
  }

  static async login(input: LoginInput): Promise<{ user: UserResponseDto; token: string }> {
    const userRow = await UserRepository.findByEmail(input.email);
    if (!userRow) {
      throw new Error('INVALID_CREDENTIALS: Invalid email or password credentials.');
    }

    const isValidPassword = await bcrypt.compare(input.password, userRow.password_hash);
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS: Invalid email or password credentials.');
    }

    const karmaScore = await UserRepository.getKarmaScore(userRow.id);
    const token = this.generateToken(userRow.id, userRow.role, userRow.password_hash);
    const userDto = UserMapper.toDto(userRow, karmaScore);

    return { user: userDto, token };
  }

  static async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const userRow = await UserRepository.findById(userId);
    if (!userRow) {
      throw new Error('USER_NOT_FOUND: User profile not found.');
    }

    const karmaScore = await UserRepository.getKarmaScore(userRow.id);
    return UserMapper.toDto(userRow, karmaScore);
  }

  static async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserResponseDto> {
    if (input.username) {
      const currentUser = await UserRepository.findById(userId);
      // Only check uniqueness if the username is actually different
      if (currentUser && input.username.toLowerCase() !== currentUser.username.toLowerCase()) {
        const existingUsername = await UserRepository.findByUsername(input.username);
        if (existingUsername && existingUsername.id !== userId) {
          throw new Error('USERNAME_EXISTS: This username is already taken.');
        }
      }
    }

    const updatedRow = await UserRepository.updateUser(userId, input);
    const karmaScore = await UserRepository.getKarmaScore(userId);
    return UserMapper.toDto(updatedRow, karmaScore);
  }

  static async deleteAccount(userId: string, currentPassword: string): Promise<void> {
    const userRow = await UserRepository.findById(userId);
    if (!userRow || !(await bcrypt.compare(currentPassword, userRow.password_hash))) {
      throw new Error('INVALID_CREDENTIALS: Current password is incorrect.');
    }
    await UserRepository.anonymizeAndDelete(userId);
  }

  static async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const userRow = await UserRepository.findById(userId);
    if (!userRow || !(await bcrypt.compare(input.currentPassword, userRow.password_hash))) {
      throw new Error('INVALID_CREDENTIALS: Current password is incorrect.');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await UserRepository.updatePasswordHash(userId, passwordHash);
  }

  private static generateToken(userId: string, role: string, passwordHash: string): string {
    const secret: jwt.Secret = env.JWT_SECRET;
    const passwordVersion = createHash('sha256').update(passwordHash).digest('hex').slice(0, 16);
    return jwt.sign({ sub: userId, role, pwd: passwordVersion }, secret, {
      expiresIn: '7d'
    });
  }
}

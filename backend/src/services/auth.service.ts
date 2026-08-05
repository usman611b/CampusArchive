import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../validators/auth.validator';
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

    const passwordHash = await bcrypt.hash(input.password, 10);

    // Auto-promote if matches FIRST_ADMIN_EMAIL
    const isFirstAdmin = env.FIRST_ADMIN_EMAIL && env.FIRST_ADMIN_EMAIL.toLowerCase() === input.email.trim().toLowerCase();
    const assignedRole = isFirstAdmin ? 'ADMINISTRATOR' : 'STUDENT';

    const newUserRow = await UserRepository.createUser({
      ...input,
      role: assignedRole as any,
      passwordHash
    });

    const token = this.generateToken(newUserRow.id, newUserRow.role);
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

    // Auto-promote if matches FIRST_ADMIN_EMAIL and not yet ADMINISTRATOR/SUPER_ADMIN
    const isFirstAdmin = env.FIRST_ADMIN_EMAIL && env.FIRST_ADMIN_EMAIL.toLowerCase() === input.email.trim().toLowerCase();
    if (isFirstAdmin && userRow.role !== 'ADMINISTRATOR' && userRow.role !== 'SUPER_ADMIN') {
      await UserRepository.updateUser(userRow.id, { role: 'ADMINISTRATOR' as any });
      userRow.role = 'ADMINISTRATOR' as any;
    }

    const karmaScore = await UserRepository.getKarmaScore(userRow.id);
    const token = this.generateToken(userRow.id, userRow.role);
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

  private static generateToken(userId: string, role: string): string {
    const secret: jwt.Secret = env.JWT_SECRET;
    return jwt.sign({ sub: userId, role }, secret, {
      expiresIn: '7d'
    });
  }
}

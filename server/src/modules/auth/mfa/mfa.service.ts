import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { randomBytes } from 'crypto';
import { User } from '@/core/domain/user/user.entity';
import { DataSource } from 'typeorm';

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerificationResponse {
  success: boolean;
  message: string;
  backupCodesRemaining?: number;
}

@Injectable()
export class MFAService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate MFA secret and QR code for user setup
   */
  async setupMFA(user: User): Promise<MFASetupResponse> {
    const secret = authenticator.generateSecret();
    const issuer = this.configService.get<string>('MFA_ISSUER', 'Contract Management System');
    const qrCode = authenticator.keyuri(user.email || user.username, issuer, secret);
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    // Update user with MFA secret and backup codes
    const userRepo = this.dataSource.getRepository(User);
    await userRepo.update(user.id, {
      mfa_secret: secret,
      backup_codes: JSON.stringify(backupCodes),
    });

    return {
      secret,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Verify MFA token
   */
  async verifyMFAToken(user: User, token: string): Promise<MFAVerificationResponse> {
    if (!user.mfa_enabled || !user.mfa_secret) {
      return { success: false, message: 'MFA is not enabled for this user' };
    }

    // Check if token is valid
    const isValid = authenticator.verify({
      token,
      secret: user.mfa_secret,
    });

    if (isValid) {
      return { success: true, message: 'MFA verification successful' };
    }

    // Check if it's a backup code
    const backupCodes = user.backup_codes ? JSON.parse(user.backup_codes) : [];
    const backupCodeIndex = backupCodes.indexOf(token);
    
    if (backupCodeIndex !== -1) {
      // Remove used backup code
      backupCodes.splice(backupCodeIndex, 1);
      const userRepo = this.dataSource.getRepository(User);
      await userRepo.update(user.id, {
        backup_codes: JSON.stringify(backupCodes),
      });

      return {
        success: true,
        message: 'Backup code verification successful',
        backupCodesRemaining: backupCodes.length,
      };
    }

    return { success: false, message: 'Invalid MFA token' };
  }

  /**
   * Enable MFA for user
   */
  async enableMFA(user: User): Promise<void> {
    const userRepo = this.dataSource.getRepository(User);
    await userRepo.update(user.id, {
      mfa_enabled: true,
    });
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(user: User): Promise<void> {
    const userRepo = this.dataSource.getRepository(User);
    await userRepo.update(user.id, {
      mfa_enabled: false,
      mfa_secret: null,
      backup_codes: null,
    });
  }

  /**
   * Generate new backup codes
   */
  async regenerateBackupCodes(user: User): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();
    const userRepo = this.dataSource.getRepository(User);
    await userRepo.update(user.id, {
      backup_codes: JSON.stringify(backupCodes),
    });
    return backupCodes;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Check if MFA is required for user
   */
  isMFARequired(user: User): boolean {
    return user.mfa_enabled && !!user.mfa_secret;
  }

  /**
   * Get remaining backup codes count
   */
  getBackupCodesRemaining(user: User): number {
    if (!user.backup_codes) return 0;
    try {
      const codes = JSON.parse(user.backup_codes);
      return Array.isArray(codes) ? codes.length : 0;
    } catch {
      return 0;
    }
  }
}
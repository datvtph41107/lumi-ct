import { Controller, Post, Body, UseGuards, Get, CurrentUser } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MFAService } from './mfa.service';
import { AuthGuardAccess } from '../guards/jwt-auth.guard';
import { CurrentUser as CurrentUserDecorator } from '@/core/shared/decorators/setmeta.decorator';
import { User } from '@/core/domain/user/user.entity';

export class SetupMFADto {
  @ApiOperation({ description: 'Setup MFA for user' })
  setup: boolean;
}

export class VerifyMFADto {
  @ApiOperation({ description: 'MFA token to verify' })
  token: string;
}

export class EnableMFADto {
  @ApiOperation({ description: 'Enable MFA for user' })
  enable: boolean;
}

@ApiTags('MFA')
@Controller('auth/mfa')
@UseGuards(AuthGuardAccess)
@ApiBearerAuth()
export class MFAController {
  constructor(private readonly mfaService: MFAService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Setup MFA for user' })
  @ApiResponse({ status: 200, description: 'MFA setup successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async setupMFA(@CurrentUserDecorator() user: User) {
    return this.mfaService.setupMFA(user);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify MFA token' })
  @ApiResponse({ status: 200, description: 'MFA verification successful' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async verifyMFA(@CurrentUserDecorator() user: User, @Body() body: VerifyMFADto) {
    return this.mfaService.verifyMFAToken(user, body.token);
  }

  @Post('enable')
  @ApiOperation({ summary: 'Enable MFA for user' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully' })
  async enableMFA(@CurrentUserDecorator() user: User) {
    await this.mfaService.enableMFA(user);
    return { success: true, message: 'MFA enabled successfully' };
  }

  @Post('disable')
  @ApiOperation({ summary: 'Disable MFA for user' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  async disableMFA(@CurrentUserDecorator() user: User) {
    await this.mfaService.disableMFA(user);
    return { success: true, message: 'MFA disabled successfully' };
  }

  @Post('backup-codes/regenerate')
  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiResponse({ status: 200, description: 'Backup codes regenerated successfully' })
  async regenerateBackupCodes(@CurrentUserDecorator() user: User) {
    const backupCodes = await this.mfaService.regenerateBackupCodes(user);
    return { success: true, backupCodes };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get MFA status' })
  @ApiResponse({ status: 200, description: 'MFA status retrieved successfully' })
  async getMFAStatus(@CurrentUserDecorator() user: User) {
    const isEnabled = user.mfa_enabled;
    const backupCodesRemaining = this.mfaService.getBackupCodesRemaining(user);
    
    return {
      isEnabled,
      backupCodesRemaining,
      isRequired: this.mfaService.isMFARequired(user),
    };
  }
}
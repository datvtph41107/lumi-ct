import { ConfigService } from '@nestjs/config';

export interface SecurityConfig {
  cors: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: string[];
        styleSrc: string[];
        scriptSrc: string[];
        imgSrc: string[];
        connectSrc: string[];
        fontSrc: string[];
        objectSrc: string[];
        mediaSrc: string[];
        frameSrc: string[];
      };
    };
  };
  session: {
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie: {
      secure: boolean;
      httpOnly: boolean;
      maxAge: number;
      sameSite: 'strict' | 'lax' | 'none';
    };
  };
  mfa: {
    enabled: boolean;
    issuer: string;
    algorithm: string;
    digits: number;
    period: number;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
  };
  account: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    sessionTimeout: number;
  };
}

export const getSecurityConfig = (configService: ConfigService): SecurityConfig => ({
  cors: {
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Client-Version',
    ],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: configService.get<number>('RATE_LIMIT_MAX', 100), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.example.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  },
  session: {
    secret: configService.get<string>('SESSION_SECRET', 'your-secret-key'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: configService.get<string>('NODE_ENV') === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict',
    },
  },
  mfa: {
    enabled: configService.get<boolean>('MFA_ENABLED', true),
    issuer: configService.get<string>('MFA_ISSUER', 'Contract Management System'),
    algorithm: 'sha1',
    digits: 6,
    period: 30,
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  },
  account: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
  },
});
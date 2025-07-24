import { Controller, Post, Body, ValidationPipe, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/login-response.interface';
import { JwtAuthGuard, CurrentUser } from '../../../../libs/shared/src/auth';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register new user',
    description: 'Creates a new user account with username and password'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User registered successfully' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed or user already exists' 
  })
  async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with username and password, returns JWT token'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5a' },
            username: { type: 'string', example: 'testuser' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials' 
  })
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Get current authenticated user profile information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5a' },
        username: { type: 'string', example: 'testuser' },
        iat: { type: 'number', example: 1625097600 },
        exp: { type: 'number', example: 1625184000 }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing JWT token' 
  })
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('users')
  @ApiOperation({ 
    summary: 'List all users (Debug endpoint)',
    description: 'Returns all users in the database for debugging purposes'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all users',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5a' },
          username: { type: 'string', example: 'testuser' },
          email: { type: 'string', example: 'testuser@example.com' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', example: '2024-07-24T09:56:54.123Z' },
          updatedAt: { type: 'string', example: '2024-07-24T09:56:54.123Z' },
          metadata: { type: 'object', example: { lastLoginAt: '2024-07-24T09:56:54.123Z', loginCount: 1 } }
        }
      }
    }
  })
  async getAllUsers() {
    // Simple find all users (excluding password field)
    const users = await this.userService['userModel'].find().select('-password').exec();
    return users;
  }
}

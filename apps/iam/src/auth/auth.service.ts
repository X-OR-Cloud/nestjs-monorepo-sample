import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/login-response.interface';
import { UserRegisterEvent, UserActionEvent, UserRegisteredEvent } from '../../../../libs/shared/src/events';
import { QueueService } from '../../../../libs/shared/src/queue';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private queueService: QueueService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.userService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = await this.userService.create(registerDto.username, registerDto.password);
    
    // Emit local events
    const userRegisterEvent: UserRegisterEvent = {
      userId: user.id.toString(),
      username: user.username,
    };
    
    const userActionEvent: UserActionEvent = {
      userId: user.id.toString(),
      service: 'iam',
      action: 'register',
      time: new Date(),
    };

    this.eventEmitter.emit('user-register', userRegisterEvent);
    this.eventEmitter.emit('user-event', userActionEvent);

    // Send cross-service event to Redis queue
    const crossServiceEvent: UserRegisteredEvent = {
      eventType: 'user.registered',
      source: 'iam',
      data: {
        userId: user.id.toString(),
        username: user.username,
        email: user.email || `${user.username}@example.com`,
        orgId: 'default-org', // Fixed: removed user.owner?.orgId
      },
      timestamp: new Date(),
    };
    
    await this.queueService.emitEvent(crossServiceEvent);

    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Enhanced JWT payload with more user info
    const payload = { 
      sub: user.id.toString(), 
      username: user.username,
      orgId: 'default-org', // Fixed: removed user.owner.orgId
      iat: Math.floor(Date.now() / 1000),
    };
    
    const accessToken = this.jwtService.sign(payload);

    // Update user metadata using Mongoose methods
    if (!user.metadata) user.metadata = {};
    user.metadata.lastLoginAt = new Date();
    user.metadata.loginCount = (user.metadata.loginCount || 0) + 1;
    user.markModified('metadata');
    await user.save(); // Save to database

    // Emit user action event
    const userActionEvent: UserActionEvent = {
      userId: user.id.toString(),
      service: 'iam',
      action: 'login',
      time: new Date(),
    };
    this.eventEmitter.emit('user-event', userActionEvent);

    return { accessToken };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.userService.findById(userId);
    if (user && !user.isDeleted()) {
      return {
        userId: user.id || user.id,
        username: user.username,
        orgId: 'default-org', // Fixed: removed user.owner.orgId
      };
    }
    return null;
  }
}

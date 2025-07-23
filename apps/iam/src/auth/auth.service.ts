import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/login-response.interface';
import { UserRegisterEvent, UserActionEvent } from '../../../../libs/shared/src/events';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.userService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = await this.userService.create(registerDto.username, registerDto.password);
    
    // Emit events
    const userRegisterEvent: UserRegisterEvent = {
      userId: user.id,
      username: user.username,
    };
    
    const userActionEvent: UserActionEvent = {
      userId: user.id,
      service: 'iam',
      action: 'register',
      time: new Date(),
    };

    this.eventEmitter.emit('user-register', userRegisterEvent);
    this.eventEmitter.emit('user-event', userActionEvent);

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
      sub: user.id, 
      username: user.username,
      orgId: user.owner.orgId,
      iat: Math.floor(Date.now() / 1000),
    };
    
    const accessToken = this.jwtService.sign(payload);

    // Update user metadata
    user.setMetadata('lastLoginAt', new Date());
    user.setMetadata('loginCount', (user.getMetadata('loginCount') || 0) + 1);
    user.markAsChanged();

    // Emit user action event
    const userActionEvent: UserActionEvent = {
      userId: user.id,
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
        userId: user.id,
        username: user.username,
        orgId: user.owner.orgId,
      };
    }
    return null;
  }
}

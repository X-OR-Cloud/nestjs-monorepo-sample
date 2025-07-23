export interface UserRegisterEvent {
  userId: string;
  username: string;
}

export interface UserActionEvent {
  userId: string;
  service: string;
  action: string;
  time: Date;
}

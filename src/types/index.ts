export interface User {
    _id: string;
    username: string;
    password?: string; // Optional since we don't send it back in responses
    type?: string;
    createdAt: string;
  }
  
  export interface Racer {
    _id: string;
    name: string;
    deviceImei?: string;
    userId: string;
    createdAt: string;
  }
  
  export interface Race {
    _id: string;
    name: string;
    startTime: string;
    endTime?: string;
    description?: string;
    racers: Racer[];
    createdAt: string;
  }
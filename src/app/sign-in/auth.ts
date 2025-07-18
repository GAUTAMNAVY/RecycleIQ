"use client";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp?: number;
  [key: string]: any;
}
interface User {
  token: string;
  [key: string]: any; // (optional: if your user has more fields)
}

function checkTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const now = Date.now() / 1000; // current time in seconds

    // console.log(decoded, now);

    return decoded.exp !== undefined && decoded.exp > now;
  } catch (err) {
    console.error("Token decoding error:", err);
    return false; // token is invalid or decoding failed
  }
}

const isLocalStorageAvailable = typeof window !== 'undefined';

export const setToken = (token: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('token', token);
    console.log('Token set:', token);
  }
};

export const getToken = () => {
  if (isLocalStorageAvailable) {
    const token = localStorage.getItem('token');
    return token;
  }
  return null;
};

export const isAuthenticated = () => {
  const token = getToken();
  const isAuth = !!token;
  return isAuth;
};

export const setUserRole = (role: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('role', role);
  }
};

export const getUserRole = () => {
  if(isLocalStorageAvailable) {
    const role = localStorage.getItem('role');
    return role;
  }
  return null;
}
export const setUser = (user: any): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getUser = (): User | null => {
  if (isLocalStorageAvailable) {
    const userString = localStorage.getItem('user');
    
    if (userString) {
      const user: User = JSON.parse(userString); // parse first

      if (user.token && checkTokenValid(user.token)) {
        console.log("token verified");
        return user;
      }
    }
  }
  console.log("token not verified");
  return null;
};

export const setUserID = (id: any): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('id', id);
  }
};

export const getUserID = (): any | null => {
  if (isLocalStorageAvailable) {
    const userId = localStorage.getItem('id');
    return userId;
  }
  return null;
};

export const setUserName = (username: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('username', username);
  }
};

export const getUserName = (): string | null => {
  if (isLocalStorageAvailable) {
    const username = localStorage.getItem('username');
    return username;
  }
  return null;
};

export const setfullname = (fullname: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('fullname', fullname);
  }
};
export const getfullname = (): string | null => {
  if (isLocalStorageAvailable) {
    const fullname = localStorage.getItem('fullname');
    return fullname;
  }
  return null;
}

export const setEmail = (email: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('email', email);
  }
};

export const getEmail = () => {
  if (isLocalStorageAvailable) {
    const email = localStorage.getItem('email');
    return email;
  }
  return null;
};

export const setPhoneNumber = (phoneNumber: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('phoneNumber', phoneNumber);
  }
};

export const getPhoneNumber = (): string | null => {
  if (isLocalStorageAvailable) {
    const phoneNumber = localStorage.getItem('phoneNumber');
    return phoneNumber;
  }
  return null;
};

export const handleLogout = (): void => {
  if (isLocalStorageAvailable) {
    localStorage.clear();
    window.location.href = "/sign-in";
  }
};

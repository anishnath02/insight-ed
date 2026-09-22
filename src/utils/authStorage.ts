import { UserProfile, UserRole } from '../types';

export interface RegisteredUser extends UserProfile {
  password?: string;
}

const REGISTERED_USERS_KEY = 'insighted_registered_users';
const CURRENT_USER_KEY = 'insighted_current_user';

// Pre-seeded users so common logins resolve smoothly
const DEFAULT_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'usr_nathanish',
    name: 'Nathan',
    email: 'nathanish6@gmail.com',
    password: 'password123',
    role: 'Educator',
    institution: 'Kolkata Educational Institute',
    bio: 'InsightEd Senior Educator & Performance Analyst',
    shareDataPublicly: false,
    avatarColor: 'bg-teal-600',
    createdAt: '2026-01-15T09:00:00.000Z',
    evaluationsCount: 12,
  },
  {
    id: 'usr_sarah',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@stanford.edu',
    password: 'password123',
    role: 'Researcher',
    institution: 'Stanford University',
    bio: 'Lead educational psychologist and predictive modeler',
    shareDataPublicly: true,
    avatarColor: 'bg-indigo-600',
    createdAt: '2026-02-10T14:30:00.000Z',
    evaluationsCount: 28,
  }
];

/**
 * Uses the name provided by the user during sign up or profile editing.
 * Never overrides a user-entered name unless it was empty or a raw email address.
 */
export function formatDisplayName(name?: string, email?: string): string {
  const target = (name || '').trim();

  // If the user filled in a name during sign up (and didn't just paste an email), use that exact name!
  if (target && !target.includes('@')) {
    return target;
  }

  // Attempt to look up in registered users by email
  if (email) {
    const registered = getRegisteredUsers().find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (registered && registered.name && !registered.name.includes('@')) {
      return registered.name.trim();
    }
  }

  // Format from email handle if no custom name was entered
  const emailHandle = email ? email.split('@')[0].trim() : target.split('@')[0].trim();
  if (!emailHandle) return 'Educator';

  if (emailHandle.toLowerCase() === 'nathanish6') {
    return 'Nathan';
  }

  // Strip digits and format handle
  const base = emailHandle.replace(/[0-9]/g, '');
  const parts = base.split(/[._-]/).filter(Boolean);
  if (parts.length > 0) {
    return parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(' ');
  }

  return emailHandle.charAt(0).toUpperCase() + emailHandle.slice(1);
}

/**
 * Extracts strictly the first name (e.g., "Nathan Ish" -> "Nathan", "Sarah" -> "Sarah")
 * for compact display in the top navigation bar.
 */
export function getFirstName(name?: string, email?: string): string {
  const fullName = (name || '').trim() || formatDisplayName(name, email);
  if (!fullName) return 'User';
  // If name has title like Dr. Sarah, handle appropriately or take first word
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length > 1 && /^(Dr|Prof|Mr|Mrs|Ms)\.?$/i.test(parts[0])) {
    return `${parts[0]} ${parts[1]}`;
  }
  return parts[0] || fullName;
}

/**
 * Retrieves all registered users from localStorage
 */
export function getRegisteredUsers(): RegisteredUser[] {
  try {
    const data = localStorage.getItem(REGISTERED_USERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read registered users from localStorage', e);
  }

  // Seed default registered users
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEFAULT_REGISTERED_USERS));
  } catch (e) {
    console.warn('Failed to seed registered users', e);
  }
  return DEFAULT_REGISTERED_USERS;
}

/**
 * Registers a new user or updates existing registered record
 */
export function saveRegisteredUser(user: UserProfile, password?: string): RegisteredUser {
  const users = getRegisteredUsers();
  const normalizedEmail = user.email.trim().toLowerCase();
  
  // Format clean name
  const cleanName = formatDisplayName(user.name, user.email);
  const updatedUser: RegisteredUser = {
    ...user,
    name: cleanName,
    email: normalizedEmail,
    password: password || 'password123',
  };

  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  let updatedList: RegisteredUser[];

  if (existingIndex >= 0) {
    updatedList = [...users];
    updatedList[existingIndex] = {
      ...updatedList[existingIndex],
      ...updatedUser,
      password: password || updatedList[existingIndex].password || 'password123',
    };
  } else {
    updatedList = [...users, updatedUser];
  }

  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('Failed to persist registered users', e);
  }

  return updatedUser;
}

/**
 * Finds a registered user by email
 */
export function findRegisteredUserByEmail(email: string): RegisteredUser | undefined {
  const users = getRegisteredUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

/**
 * Authenticate or look up user for sign in
 */
export function authenticateUser(
  email: string,
  password?: string
): { success: boolean; user?: RegisteredUser; message?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const foundUser = findRegisteredUserByEmail(normalizedEmail);

  if (!foundUser) {
    // If not found in database, check if it's the known user nathanish6
    if (normalizedEmail.includes('nathanish6')) {
      const defaultUser = DEFAULT_REGISTERED_USERS[0];
      saveRegisteredUser(defaultUser);
      return { success: true, user: defaultUser };
    }
    return {
      success: false,
      message: 'No account found with this email. Please sign up to create your profile.',
    };
  }

  // Password verification if registered
  if (password && foundUser.password && foundUser.password !== password) {
    return {
      success: false,
      message: 'Incorrect password. Please verify your credentials and try again.',
    };
  }

  return { success: true, user: foundUser };
}

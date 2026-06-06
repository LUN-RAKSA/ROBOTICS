/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;      // Unique Identifier
  fullName: string;
  age: number;
  course: string;   // Shown as "Level" (e.g. ROBOTICS INTRO, EMBEDDED C)
  session: string;  // Session (e.g. Morning, Evening)
  level: string;    // Shown as "Course" (e.g. 3D, Python, Sensor, AI, Super:Bit, HTML,CSS)
  email?: string;
  attendance?: { [weekKey: string]: 'P' | 'A' | 'L' | 'E' };
}

export interface TerminalLog {
  text: string;
  type: 'input' | 'output' | 'success' | 'error' | 'header' | 'menu';
  timestamp: string;
}

export type CLIStep =
  | 'MENU_SELECTION'
  // Add Student steps
  | 'ADD_ID'
  | 'ADD_NAME'
  | 'ADD_AGE'
  | 'ADD_GRADE'
  | 'ADD_EMAIL'
  // Search Student steps
  | 'SEARCH_ID'
  // Update Student steps
  | 'UPDATE_ID'
  | 'UPDATE_FIELD_SELECT'
  | 'UPDATE_VALUE'
  // Delete Student steps
  | 'DELETE_ID'
  | 'DELETE_CONFIRM';

export interface CLIState {
  step: CLIStep;
  tempData: Partial<Student> & {
    updateField?: 'course' | 'email' | 'session' | 'level';
    deleteTargetId?: string;
  };
}

export interface LoginEvent {
  id: string;
  email: string;
  role: 'admin' | 'user';
  timestamp: string;
  browser: string;
  platform: string;
  ipAddress: string;
}


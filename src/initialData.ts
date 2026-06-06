/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU01',
    fullName: 'SOPHIA MARTINEZ',
    age: 18,
    course: 'Level 1',
    session: 'Session01',
    level: '3D',
    email: 'sophia.m@school.edu',
    attendance: {
      week1: 'P', week2: 'P', week3: 'A', week4: 'P', week5: 'L', week6: 'P', week7: 'E', week8: 'P'
    }
  },
  {
    id: 'STU02',
    fullName: 'ALEXANDER WRIGHT',
    age: 17,
    course: 'Level 2',
    session: 'Session02',
    level: 'Python',
    email: 'a.wright@school.edu',
    attendance: {
      week1: 'P', week2: 'P', week3: 'P', week4: 'A', week5: 'P', week6: 'L', week7: 'P'
    }
  },
  {
    id: 'STU03',
    fullName: 'EMILY JOHNSON',
    age: 15,
    course: 'Level 3',
    session: 'Session03',
    level: 'Sensor',
    email: 'emily.j@school.edu',
    attendance: {
      week1: 'P', week2: 'A', week3: 'L', week4: 'P', week5: 'P', week6: 'E', week7: 'P', week8: 'P'
    }
  },
  {
    id: 'STU04',
    fullName: 'DANIEL KIM',
    age: 18,
    course: 'Level 4',
    session: 'Session04',
    level: 'AI',
    email: 'd.kim2026@school.edu',
    attendance: {
      week1: 'P', week2: 'P', week3: 'P', week4: 'P', week5: 'A', week6: 'P', week7: 'P'
    }
  },
  {
    id: 'STU05',
    fullName: 'OLIVIA CHEN',
    age: 17,
    course: 'Level 5',
    session: 'Session05',
    level: 'Super:Bit',
    email: 'o.chen@school.edu',
    attendance: {
      week1: 'P', week2: 'P', week3: 'P', week4: 'L', week5: 'P', week6: 'P', week7: 'P', week8: 'A'
    }
  }
];

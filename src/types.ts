export type ParentalEducationLevel = 0 | 1 | 2; // 0: High School, 1: Bachelor's, 2: Master's/PhD

export type ModelType = 'random_forest' | 'linear_regression';

export type ActiveView = 'home' | 'predict' | 'analysis' | 'about' | 'contact';

export interface StudentInput {
  studentId: string;
  studentName: string;
  attendanceRate: number; // 50.0 - 100.0%
  weeklyStudyHours: number; // 0 - 50
  previousSemesterScore: number; // 40.0 - 100.0%
  sleepHoursPerNight: number; // 4.0 - 10.0
  extracurricularActivities: 0 | 1;
  parentalEducationLevel: ParentalEducationLevel;
  internetAccessAtHome: 0 | 1;
  partTimeJob: 0 | 1;
  learningDisability: 0 | 1;
}

export interface FactorContribution {
  featureKey: keyof Omit<StudentInput, 'studentId' | 'studentName'>;
  label: string;
  userValue: number | string;
  unit: string;
  weight: number;
  contribution: number; // weight * userValue or tree feature attribution
  isPositive: boolean;
  impactLevel: 'high' | 'medium' | 'low';
}

export interface PredictionResult {
  rawScore: number;
  finalScore: number; // clamped 0 - 100, formatted to 2 decimals
  status: 'passed' | 'failed';
  passed: boolean;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  gradeColor: string;
  factorContributions: FactorContribution[];
  topPositiveFactors: FactorContribution[];
  topNegativeFactors: FactorContribution[];
  recommendations: string[];
  calculatedAt: string;
  modelUsed: ModelType;
  modelName: string;
  modelAccuracy: {
    testR2: number;
    testMse: number;
    trainingR2: number;
    trainingMse: number;
  };
  treeEnsembleDetails?: {
    numTrees: number;
    maxDepth: number;
    treeVariance: number;
  };
}

export interface StudentRecord extends StudentInput {
  id: string;
  prediction: PredictionResult;
  createdAt: string;
}

export interface ModelComparisonRow {
  method: string;
  trainingMse: number;
  trainingR2: number;
  testMse: number;
  testR2: number;
  bestFor: string;
  isPrimary?: boolean;
}

export interface ScatterPoint {
  actual: number;
  predicted: number;
  linearPredicted?: number;
  rfPredicted?: number;
  studentName?: string;
  studentId?: string;
  passed: boolean;
}

export type UserRole = 'Educator' | 'Student' | 'Researcher' | 'Administrator' | 'Counselor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
  bio?: string;
  avatarColor?: string;
  shareDataPublicly: boolean; // Whether the user wants to show their data to everyone or keep it private
  createdAt: string;
  evaluationsCount?: number;
}

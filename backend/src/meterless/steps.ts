import { MissionTraceStep } from "../analyzer/types.js";

export interface StepExecutionContext {
  poId: string;
  missionId: string;
  startTime: number;
}

export type StepHandler = (context: StepExecutionContext) => Promise<MissionTraceStep>;

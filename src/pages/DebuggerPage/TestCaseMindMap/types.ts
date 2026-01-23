export interface MindMapNodeData {
  uid: string;
  text: string;
  expand?: boolean;
  isRoot?: boolean;
  layerIndex?: number;
  customLeft?: number;
  customTop?: number;
  children?: MindMapNodeData[];
}

export interface TestCaseNodeData extends MindMapNodeData {
  testCaseId?: string;
  testCaseName?: string;
  preConditions?: string;
  testSteps?: TestCaseStep[];
  expectedResult?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'running' | 'passed' | 'failed';
  tags?: string[];
}

export interface TestCaseStep {
  stepId: string;
  stepNumber: number;
  description: string;
  expectedResult: string;
  actionType?: 'click' | 'input' | 'select' | 'wait' | 'assert';
  targetElement?: string;
  inputValue?: string;
}

export interface MindMapConfig {
  theme: string;
  layout: string;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MindMapRef {
  mindMap: any;
  container: HTMLDivElement | null;
  getData: (withConfig?: boolean) => any;
  setData: (data: MindMapNodeData) => void;
  execCommand: (command: string, ...args: any[]) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  destroy: () => void;
}

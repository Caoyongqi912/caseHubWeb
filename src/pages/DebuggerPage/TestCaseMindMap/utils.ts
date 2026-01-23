import { TestCaseNodeData, TestCaseStep } from './types';

export const generateUid = (): string => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const findNodeByUid = (
  data: TestCaseNodeData,
  uid: string,
): TestCaseNodeData | null => {
  if (data.uid === uid) {
    return data;
  }
  if (data.children) {
    for (const child of data.children) {
      const found = findNodeByUid(child, uid);
      if (found) return found;
    }
  }
  return null;
};

export const updateNodeByUid = (
  data: TestCaseNodeData,
  uid: string,
  updates: Partial<TestCaseNodeData>,
): TestCaseNodeData => {
  if (data.uid === uid) {
    return { ...data, ...updates };
  }
  if (data.children) {
    return {
      ...data,
      children: data.children.map((child) =>
        updateNodeByUid(child, uid, updates),
      ),
    };
  }
  return data;
};

export const deleteNodeByUid = (
  data: TestCaseNodeData,
  uid: string,
): TestCaseNodeData | null => {
  if (data.uid === uid) {
    return null;
  }
  if (data.children) {
    const newChildren = data.children
      .map((child) => deleteNodeByUid(child, uid))
      .filter((child): child is TestCaseNodeData => child !== null);
    return { ...data, children: newChildren };
  }
  return data;
};

export const addNodeToParent = (
  data: TestCaseNodeData,
  parentUid: string,
  newNode: TestCaseNodeData,
  position?: number,
): TestCaseNodeData => {
  if (data.uid === parentUid) {
    const children = data.children || [];
    const newChildren = [...children];
    if (
      position !== undefined &&
      position >= 0 &&
      position < newChildren.length
    ) {
      newChildren.splice(position, 0, newNode);
    } else {
      newChildren.push(newNode);
    }
    return { ...data, children: newChildren };
  }
  if (data.children) {
    return {
      ...data,
      children: data.children.map((child) =>
        addNodeToParent(child, parentUid, newNode, position),
      ),
    };
  }
  return data;
};

export const addSiblingNode = (
  data: TestCaseNodeData,
  nodeUid: string,
  newNode: TestCaseNodeData,
  position?: number,
): TestCaseNodeData => {
  const addSiblingToChildren = (
    children: TestCaseNodeData[],
  ): TestCaseNodeData[] => {
    const newChildren = [...children];
    const index = newChildren.findIndex((child) => child.uid === nodeUid);
    if (index !== -1) {
      if (
        position !== undefined &&
        position >= 0 &&
        position < newChildren.length
      ) {
        newChildren.splice(position, 0, newNode);
      } else {
        newChildren.splice(index + 1, 0, newNode);
      }
    }
    return newChildren;
  };

  if (data.children) {
    const childIndex = data.children.findIndex(
      (child) => child.uid === nodeUid,
    );
    if (childIndex !== -1) {
      return {
        ...data,
        children: addSiblingToChildren(data.children),
      };
    }
    return {
      ...data,
      children: data.children.map((child) =>
        addSiblingNode(child, nodeUid, newNode, position),
      ),
    };
  }
  return data;
};

export const moveNode = (
  data: TestCaseNodeData,
  nodeUid: string,
  targetParentUid: string,
  position?: number,
): TestCaseNodeData => {
  const nodeToRemove = findNodeByUid(data, nodeUid);
  if (!nodeToRemove) return data;

  const dataWithoutNode = deleteNodeByUid(data, nodeUid);
  if (!dataWithoutNode) return data;

  return addNodeToParent(
    dataWithoutNode,
    targetParentUid,
    nodeToRemove,
    position,
  );
};

export const cloneNode = (node: TestCaseNodeData): TestCaseNodeData => {
  return JSON.parse(JSON.stringify(node));
};

export const countNodes = (data: TestCaseNodeData): number => {
  let count = 1;
  if (data.children) {
    for (const child of data.children) {
      count += countNodes(child);
    }
  }
  return count;
};

export const getAllNodes = (data: TestCaseNodeData): TestCaseNodeData[] => {
  const nodes: TestCaseNodeData[] = [data];
  if (data.children) {
    for (const child of data.children) {
      nodes.push(...getAllNodes(child));
    }
  }
  return nodes;
};

export const searchNodes = (
  data: TestCaseNodeData,
  keyword: string,
): TestCaseNodeData[] => {
  const allNodes = getAllNodes(data);
  const lowerKeyword = keyword.toLowerCase();
  return allNodes.filter(
    (node) =>
      node.text.toLowerCase().includes(lowerKeyword) ||
      node.testCaseId?.toLowerCase().includes(lowerKeyword) ||
      node.tags?.some((tag) => tag.toLowerCase().includes(lowerKeyword)),
  );
};

export const filterNodesByStatus = (
  data: TestCaseNodeData,
  status: string,
): TestCaseNodeData[] => {
  const allNodes = getAllNodes(data);
  return allNodes.filter((node) => node.status === status);
};

export const filterNodesByPriority = (
  data: TestCaseNodeData,
  priority: string,
): TestCaseNodeData[] => {
  const allNodes = getAllNodes(data);
  return allNodes.filter((node) => node.priority === priority);
};

export const validateTestCaseNode = (node: TestCaseNodeData): boolean => {
  if (!node.text || node.text.trim() === '') {
    return false;
  }
  if (node.testCaseId && !/^[A-Z]{2}\d{3}$/.test(node.testCaseId)) {
    return false;
  }
  if (node.testSteps) {
    for (const step of node.testSteps) {
      if (!step.description || step.description.trim() === '') {
        return false;
      }
    }
  }
  return true;
};

export const formatTestCaseForExport = (data: TestCaseNodeData): string => {
  const formatNode = (node: TestCaseNodeData, level: number = 0): string => {
    const indent = '  '.repeat(level);
    let result = `${indent}${node.text}`;

    if (node.testCaseId) {
      result += ` [${node.testCaseId}]`;
    }
    if (node.priority) {
      result += ` [优先级: ${node.priority}]`;
    }
    if (node.status) {
      result += ` [状态: ${node.status}]`;
    }
    result += '\n';

    if (node.preConditions) {
      result += `${indent}  前置条件: ${node.preConditions}\n`;
    }

    if (node.testSteps && node.testSteps.length > 0) {
      result += `${indent}  测试步骤:\n`;
      node.testSteps.forEach((step) => {
        result += `${indent}    ${step.stepNumber}. ${step.description}\n`;
        result += `${indent}      预期结果: ${step.expectedResult}\n`;
      });
    }

    if (node.expectedResult) {
      result += `${indent}  预期结果: ${node.expectedResult}\n`;
    }

    if (node.children) {
      for (const child of node.children) {
        result += formatNode(child, level + 1);
      }
    }

    return result;
  };

  return formatNode(data);
};

export const createDefaultTestCaseStep = (stepNumber: number): TestCaseStep => {
  return {
    stepId: generateUid(),
    stepNumber,
    description: '',
    expectedResult: '',
    actionType: 'click',
  };
};

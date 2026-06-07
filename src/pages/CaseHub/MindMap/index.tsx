/**
 * 旧入口 /cases/caseHub/requirementMindMap 的薄壳
 * 仅做 URL 参数到 MindMapCanvas props 的转换。
 *
 * 新流程请直接使用：
 *   import MindMapCanvas from '@/pages/CaseHub/MindMap/MindMapCanvas';
 * 并以 planId 模式嵌入测试计划的脑图 Tab。
 */
import { useParams } from '@umijs/max';
import MindMapCanvas from './MindMapCanvas';

const Index = () => {
  const { reqId, projectId, moduleId } = useParams<{
    reqId: string;
    projectId: string;
    moduleId: string;
  }>();

  // moduleId 仅用于兼容旧字段，未透传到 MindMapCanvas
  void moduleId;

  return (
    <MindMapCanvas requirementId={reqId} projectId={Number(projectId) || 0} />
  );
};

export default Index;

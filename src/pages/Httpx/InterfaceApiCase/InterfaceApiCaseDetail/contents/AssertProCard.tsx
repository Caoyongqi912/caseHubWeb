import { updateCaseContent } from '@/api/inter/interCase';
import AssertContentCard, {
  AssertContentInfo,
} from '@/components/ContentCard/AssertContentCard';
import CardExtraOption from '@/pages/Httpx/InterfaceApiCase/InterfaceApiCaseDetail/contents/CardExtraOption';
import { IInterfaceCaseContent } from '@/pages/Httpx/types';
import { FC, useCallback, useMemo, useState } from 'react';

interface Props {
  id: number;
  step: number;
  caseId: number;
  caseContent: IInterfaceCaseContent;
  callback?: () => void;
  setCanDraggable?: (canDraggable: boolean) => void;
}

const AssertProCard: FC<Props> = (props) => {
  const { step, id, caseId, caseContent, callback } = props;
  const [showOption, setShowOption] = useState(false);

  const handleUpdateAssert = useCallback(
    async (data: {
      id: number;
      content_name?: string;
      assert_list?: any[];
    }) => {
      return updateCaseContent({
        content_id: data.id,
        content_name: data.content_name,
        assert_list: data.assert_list,
      });
    },
    [],
  );

  const contentInfo: AssertContentInfo = useMemo(
    () => ({
      id: caseContent.id,
      content_name: caseContent.content_name,
      assert_list: caseContent.assert_list,
    }),
    [caseContent.id, caseContent.content_name, caseContent.assert_list],
  );

  return (
    <AssertContentCard
      id={id}
      step={step}
      caseId={caseId}
      contentInfo={contentInfo}
      callback={callback}
      extra={
        <CardExtraOption
          show={showOption}
          callback={callback}
          caseContent={caseContent}
          caseId={caseId}
        />
      }
      showExtra={showOption}
      onMouseEnter={() => setShowOption(true)}
      onMouseLeave={() => setShowOption(false)}
      updateAssert={handleUpdateAssert}
    />
  );
};

export default AssertProCard;

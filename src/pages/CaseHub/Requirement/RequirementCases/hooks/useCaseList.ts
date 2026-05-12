import {
  queryCasesByRequirement,
  queryTagsByRequirement,
} from '@/api/case/testCase';
import { CaseSearchForm, ITestCase } from '@/pages/CaseHub/types';
import { useCallback, useEffect, useState } from 'react';

interface UseCaseListResult {
  testCases: ITestCase[];
  tags: { label: string; value: string }[];
  setTags: React.Dispatch<
    React.SetStateAction<{ label: string; value: string }[]>
  >;
  loading: boolean;
  reloadKey: number;
  refresh: () => void;
  updateCaseData: (
    caseId: number,
    field: keyof ITestCase,
    value: unknown,
  ) => void;
}

interface UseCaseListOptions {
  reqId: string | undefined;
  searchInfo: CaseSearchForm;
}

export const useCaseList = (options: UseCaseListOptions): UseCaseListResult => {
  const { reqId, searchInfo } = options;

  const [testCases, setTestCases] = useState<ITestCase[]>([]);
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  const updateCaseData = useCallback(
    (caseId: number, field: keyof ITestCase, value: unknown) => {
      setTestCases((prev) =>
        prev.map((tc) => (tc.id === caseId ? { ...tc, [field]: value } : tc)),
      );
    },
    [],
  );

  useEffect(() => {
    if (!reqId) return;

    const fetchCases = async () => {
      try {
        setLoading(true);
        const searchValues = {
          requirement_id: reqId,
          ...searchInfo,
        };
        const { code, data } = await queryCasesByRequirement(searchValues);
        if (code === 0) {
          setTestCases(data);
        }
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [reqId, reloadKey, searchInfo]);

  useEffect(() => {
    if (!reqId) return;

    queryTagsByRequirement({ requirement_id: parseInt(reqId) }).then(
      ({ code, data }) => {
        if (code === 0 && data.length > 0) {
          setTags(data.map((tag) => ({ label: tag, value: tag })));
        }
      },
    );
  }, [reqId]);

  return {
    testCases,
    tags,
    setTags,
    loading,
    reloadKey,
    refresh,
    updateCaseData,
  };
};

export default useCaseList;

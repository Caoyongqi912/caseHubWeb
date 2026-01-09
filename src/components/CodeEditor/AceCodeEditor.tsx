import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-xcode';
import { FC, useRef } from 'react';
import AceEditor from 'react-ace';
import { useModel } from 'umi';

interface selfProps {
  value?: any;
  readonly?: boolean;
  height?: string;
  onChange?: (value: string) => void;
  _mode?: string;
  gutter?: boolean;
}

const AceCodeEditor: FC<selfProps> = (props) => {
  const editorRef = useRef<any>(null);

  const {
    value,
    readonly,
    height = '30vh',
    onChange,
    _mode = 'json',
    gutter = true,
  } = props;
  const { initialState } = useModel('@@initialState');
  const currentTheme = initialState?.theme || 'light'; // 统一使用 theme 拼写
  const editorTheme = currentTheme === 'realDark' ? 'twilight' : 'xcode';
  return (
    // @param onChange - 当代码内容发生变化时的回调函数
    // @param showGutter - 是否显示行号
    // @param showPrintMargin - 是否显示打印边距
    // @param wrapEnabled - 是否启用代码自动换行
    // @param highlightActiveLine - 是否高亮当前行
    // @param editorProps - 编辑器的其他属性设置
    // @param setOptions - 编辑器的配置选项
    <>
      <AceEditor
        style={{ borderRadius: 20 }}
        theme={editorTheme}
        mode={_mode}
        readOnly={readonly || false}
        height={height || '100%'}
        width={'100%'}
        value={value}
        fontSize={14}
        onChange={onChange}
        showGutter={gutter} //是否显示行号
        showPrintMargin={true}
        enableBasicAutocompletion={true} //启用基本自动补全
        enableLiveAutocompletion={true} //启用实时自动补全
        wrapEnabled={true} // 是否启用代码自动换行
        highlightActiveLine={true}
        editorProps={{
          $blockScrolling: true,
          $highlightPending: true,
          $highlightTagPending: true,
          $enableMultiselect: true,
        }}
        setOptions={{
          showLineNumbers: true,
          highlightActiveLine: true,
          cursorStyle: 'ace',
          highlightSelectedWord: true,
          tabSize: 4,
          behavioursEnabled: true,
          readOnly: readonly || false,
          enableLiveAutocompletion: true,
          autoScrollEditorIntoView: true,
          useWorker: true,
          useSoftTabs: true,
        }}
        key={`${editorTheme}_${_mode}`} // 关键修复：添加key强制重新渲染
      />
    </>
  );
};

export default AceCodeEditor;

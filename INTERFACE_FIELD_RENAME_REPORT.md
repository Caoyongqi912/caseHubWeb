# Interface API 字段重命名报告

## 更新日期
2026-04-08

## 概述
根据后端 `Interface` 模型，将前端 `IInterfaceAPI` 接口的所有字段从 camelCase 改为 snake_case，以匹配后端数据库字段命名规范。

## 字段映射表

| 旧字段名 (camelCase) | 新字段名 (snake_case) |
|---------------------|----------------------|
| `name` | `interface_name` |
| `description` | `interface_desc` |
| `status` | `interface_status` |
| `level` | `interface_level` |
| `url` | `interface_url` |
| `method` | `interface_method` |
| `params` | `interface_params` |
| `headers` | `interface_headers` |
| `body_type` | `interface_body_type` |
| `raw_type` | `interface_raw_type` |
| `auth_type` | `interface_auth_type` |
| `auth` | `interface_auth` |
| `body` | `interface_body` |
| `data` | `interface_data` |
| `asserts` | `interface_asserts` |
| `extracts` | `interface_extracts` |
| `follow_redirects` | `interface_follow_redirects` |
| `connect_timeout` | `interface_connect_timeout` |
| `response_timeout` | `interface_response_timeout` |
| `before_script` | `interface_before_script` |
| `before_db_id` | `interface_before_db_id` |
| `before_sql` | `interface_before_sql` |
| `before_sql_extracts` | `interface_before_sql_extracts` |
| `after_script` | `interface_after_script` |
| `before_params` | `interface_before_params` |

## 更新的文件列表

### 1. 类型定义文件
| 文件路径 | 更新内容 |
|---------|---------|
| `src/pages/Httpx/types.ts` | `IInterfaceAPI` 接口字段定义 |

### 2. 接口详情相关组件
| 文件路径 | 更新内容 |
|---------|---------|
| `src/pages/Httpx/Interface/InterfaceApiDetail/ApiDetailForm.tsx` | `name` → `interface_name`, `url` → `interface_url`, `method` → `interface_method`, `description` → `interface_desc`, `params` → `interface_params`, `headers` → `interface_headers`, `body_type` → `interface_body_type` |
| `src/pages/Httpx/Interface/InterfaceApiDetail/ApiBaseForm.tsx` | `level` → `interface_level`, `status` → `interface_status` |

### 3. 通用组件
| 文件路径 | 更新内容 |
|---------|---------|
| `src/pages/Httpx/componets/InterHeader.tsx` | `headers` → `interface_headers` |
| `src/pages/Httpx/componets/InterBody/index.tsx` | `body_type` → `interface_body_type`, `raw_type` → `interface_raw_type` |
| `src/pages/Httpx/componets/InterBody/JsonBody.tsx` | `body` → `interface_body` |
| `src/pages/Httpx/componets/InterBody/APIFormData.tsx` | `data` → `interface_data` |
| `src/pages/Httpx/componets/InterParam.tsx` | `params` → `interface_params` |
| `src/pages/Httpx/componets/InterAuth.tsx` | `auth_type` → `interface_auth_type`, `auth` → `interface_auth` |
| `src/pages/Httpx/componets/InterExtractList.tsx` | `extracts` → `interface_extracts` |
| `src/pages/Httpx/componets/InterAssertList.tsx` | `asserts` → `interface_asserts` |
| `src/pages/Httpx/componets/InterOtherSetting.tsx` | `level` → `interface_level`, `status` → `interface_status`, `follow_redirects` → `interface_follow_redirects`, `connect_timeout` → `interface_connect_timeout`, `response_timeout` → `interface_response_timeout` |
| `src/pages/Httpx/componets/InterBeforeSQL.tsx` | `before_db_id` → `interface_before_db_id`, `before_sql` → `interface_before_sql`, `before_sql_extracts` → `interface_before_sql_extracts` |
| `src/pages/Httpx/componets/InterBeforeParams.tsx` | `before_params` → `interface_before_params` |
| `src/pages/Httpx/componets/InterScript.tsx` | `before_script` → `interface_before_script`, `after_script` → `interface_after_script` |
| `src/pages/Httpx/componets/InterAfterScript.tsx` | `after_script` → `interface_after_script` |

### 4. 表格组件
| 文件路径 | 更新内容 |
|---------|---------|
| `src/pages/Httpx/Interface/InterfaceApiTable/index.tsx` | `name` → `interface_name`, `url` → `interface_url`, `method` → `interface_method`, `level` → `interface_level`, `status` → `interface_status` |
| `src/pages/Httpx/Interface/interfaceApiGroup/GroupApiCollapsibleCard.tsx` | `method` → `interface_method`, `name` → `interface_name`, `url` → `interface_url` |
| `src/pages/Httpx/Interface/interfaceApiGroup/GroupInterfaceTable.tsx` | `name` → `interface_name`, `level` → `interface_level`, `status` → `interface_status` |
| `src/pages/Httpx/InterfaceApiCaseResult/InterfaceCaseChoiceApiTable.tsx` | `name` → `interface_name`, `level` → `interface_level`, `status` → `interface_status` |
| `src/pages/Httpx/InterfaceApiCaseTask/InterfaceApiCaseTaskDetail/AssociationApis.tsx` | `name` → `interface_name`, `level` → `interface_level`, `status` → `interface_status` |

## 统计

- **总计更新文件数**: 21 个
- **新增字段前缀**: `interface_`
- **删除字段**: 无

## 注意事项

1. 所有表单字段名称已更新为 snake_case 格式
2. API 调用返回的数据应与新的字段名保持一致
3. 如有其他模块使用 `IInterfaceAPI` 类型，请同步更新
4. 组件内部状态管理如使用旧字段名，需要同步更新

## 后端配合

后端 `Interface` 模型的字段名已经与前端保持一致，无需额外修改。

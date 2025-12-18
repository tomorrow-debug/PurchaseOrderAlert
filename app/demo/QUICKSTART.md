# 快速启动指南

## 运行 Demo 应用

### 方法 1: 通过 CAP 服务器运行 (推荐)

1. 在项目根目录运行:
```bash
cds watch
```

2. 打开浏览器访问:
- **Demo 应用**: http://localhost:4004/demo/webapp/index.html

### 方法 2: 直接打开 HTML 文件

直接在浏览器中打开:
```
app/demo/webapp/index.html
```

注意: 这种方式需要确保 OData 服务已经运行在 http://localhost:4004

## 项目结构

### 文件结构

**Demo 应用 (app/demo/)**
```
demo/
├── webapp/
│   ├── manifest.json         # 完整配置
│   ├── Component.js          # 完整组件逻辑
│   ├── index.html
│   ├── controller/           # 所有控制器都是手写的
│   │   ├── App.controller.js
│   │   ├── List.controller.js
│   │   └── Detail.controller.js
│   ├── view/                 # 所有视图都是手写的
│   │   ├── App.view.xml
│   │   ├── List.view.xml
│   │   ├── Detail.view.xml
│   │   └── fragments/
│   ├── model/                # 工具类和格式化器
│   └── i18n/                 # 国际化
└── README.md
```

## 功能特性

| 功能 | 支持状态 | 说明 |
|------|---------|------|
| List Report | ✅ | 列表页 |
| Object Page | ✅ | 详情页 |
| 搜索 | ✅ | 全文搜索 |
| 筛选 | ✅ | 字段筛选 |
| 排序 | ✅ | 多字段排序 |
| 分页 | ✅ | 数据分页 |
| 编辑 | ✅ | 直接编辑 |
| 删除 | ✅ | 删除记录 |
| 国际化 | ✅ | 中英文支持 |
| 响应式 | ✅ | 移动端适配 |
| Gantt 图 | ✅ | 时间线可视化 |

## 技术栈

- SAP UI5 / SAPUI5
- OData V4
- CAP (Cloud Application Programming Model)
- CDS (Core Data Services)
- Gantt Chart Control

## 下一步

1. **运行应用**，熟悉功能
2. **查看代码**，理解实现
3. **尝试修改**，添加新功能
4. **部署到云端**，生产使用

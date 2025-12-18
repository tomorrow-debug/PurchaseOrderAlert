# Purchase Request Management - Basic Template Demo

这是一个使用 **Basic Template (基础模板)** 实现的采购请求管理应用，用于演示如何不依赖 Fiori Elements 的自动生成功能，手动编写更灵活、可控的 UI5 应用。

## 📋 项目简介

与原始的 Fiori Elements List Report 模板相比，这个 Basic 版本提供了：

- ✅ **完全的代码控制** - 所有 UI 和逻辑都是手写的，可以自由定制
- ✅ **灵活的扩展性** - 易于添加自定义功能和业务逻辑
- ✅ **深入理解** - 通过手动实现了解 UI5 框架的工作原理
- ✅ **无黑盒** - 没有自动生成的隐藏逻辑，所有代码透明可见

## 🏗️ 项目结构

```
demo/
├── webapp/
│   ├── controller/          # 控制器
│   │   ├── App.controller.js
│   │   ├── List.controller.js
│   │   └── Detail.controller.js
│   ├── view/                # 视图
│   │   ├── App.view.xml
│   │   ├── List.view.xml
│   │   ├── Detail.view.xml
│   │   └── fragments/       # 片段
│   │       ├── FilterDialog.fragment.xml
│   │       └── SortDialog.fragment.xml
│   ├── model/               # 模型和工具
│   │   └── formatter.js     # 格式化函数
│   ├── i18n/                # 国际化资源
│   │   ├── i18n.properties
│   │   └── i18n_zh_CN.properties
│   ├── css/                 # 样式
│   │   └── style.css
│   ├── Component.js         # 组件入口
│   ├── manifest.json        # 应用清单
│   └── index.html           # HTML 入口
├── package.json
├── ui5.yaml
└── README.md
```

## 🎯 核心功能

### 1. List 页面 (列表报告)
- 📊 响应式表格展示采购请求
- 🔍 全文搜索功能 (PR号、物料、描述)
- 🎯 筛选功能 (优先级、状态)
- 📈 排序功能 (多字段可选)
- 🔄 刷新数据
- 🎨 优先级颜色指示器 (红/橙/绿)
- 📱 移动端适配

### 2. Detail 页面 (对象页)
- 📝 动态页面布局 (DynamicPage)
- 📋 分组表单展示详细信息
  - 请求详情
  - 数量与价格
  - 日期信息
  - 组织详情
- 🔄 采购流程表格
- ✏️ 编辑模式切换
- 💾 保存/取消功能
- 🗑️ 删除功能
- ⬅️ 导航返回

### 3. 数据绑定
- 🔗 OData V4 数据服务集成
- 📊 自动扩展关联实体 ($expand)
- 🔄 双向数据绑定
- 📡 服务器端分页和过滤

## 🆚 对比 Fiori Elements

| 特性 | Fiori Elements | Basic Template |
|------|----------------|----------------|
| **开发速度** | ⚡ 极快 (注解驱动) | 🐢 较慢 (手动编码) |
| **代码量** | 📦 少 (主要是注解) | 📚 多 (完整实现) |
| **灵活性** | 🔒 受限于框架 | 🎨 完全自由 |
| **学习曲线** | 📖 需了解注解和约定 | 📘 需掌握 UI5 API |
| **定制化** | ⚙️ 通过扩展点 | 🛠️ 直接修改代码 |
| **控制力** | 🤖 部分自动化 | 👨‍💻 完全手动控制 |
| **适用场景** | 标准业务应用 | 高度定制应用 |

## 🚀 运行应用

### 方式 1: 直接在浏览器打开
```bash
# 在项目根目录运行
cds watch
```
然后访问: http://localhost:4004/demo/webapp/index.html

### 方式 2: 使用 UI5 CLI (如果安装了)
```bash
cd app/demo
npm install
npm start
```

## 📝 关键代码说明

### 1. 路由配置 (manifest.json)
```json
"routing": {
  "routes": [
    {
      "pattern": "",
      "name": "RouteList",
      "target": "TargetList"
    },
    {
      "pattern": "PurchaseRequest/{objectId}",
      "name": "RouteDetail",
      "target": "TargetDetail"
    }
  ]
}
```

### 2. 数据绑定 (List.view.xml)
```xml
<Table
    items="{
        path: '/PurchaseRequests',
        parameters: {
            $expand: 'priority,requestStatus,supplier'
        },
        sorter: {
            path: 'priority_code',
            descending: false
        }
    }">
```

### 3. 格式化器 (formatter.js)
```javascript
formatCriticalityState: function (iCriticality) {
    switch (iCriticality) {
        case 1: return "Error";    // High - Red
        case 2: return "Warning";  // Medium - Orange
        case 3: return "Success";  // Low - Green
    }
}
```

### 4. 导航逻辑 (List.controller.js)
```javascript
onItemPress: function (oEvent) {
    var oContext = oEvent.getSource().getBindingContext();
    var sObjectId = oContext.getProperty("ID");
    
    this.getOwnerComponent().getRouter().navTo("RouteDetail", {
        objectId: sObjectId
    });
}
```

## 🎓 学习要点

通过这个 Basic 实现，你可以学到：

1. **MVC 架构** - 视图、控制器和模型的分离
2. **数据绑定** - OData V4 模型的使用
3. **路由导航** - 页面间的导航和参数传递
4. **UI5 控件** - Table, Form, DynamicPage 等核心控件
5. **事件处理** - 用户交互的响应
6. **格式化器** - 数据的展示转换
7. **国际化** - i18n 资源文件的使用
8. **片段** - Fragment 的重用

## 🔧 自定义扩展建议

基于这个基础版本，你可以轻松添加：

- 📊 图表可视化 (使用 sap.viz 或 sap.suite.ui.commons)
- 📄 PDF 导出功能
- 📧 邮件通知功能
- 🔐 权限控制
- 📝 工作流集成
- 🎨 自定义主题
- 📱 离线模式
- 🔔 实时通知

## 📚 相关资源

- [SAPUI5 官方文档](https://sapui5.hana.ondemand.com/)
- [UI5 Best Practices](https://sapui5.hana.ondemand.com/topic/28fcd55b04654977b63dacbee0552712)
- [OData V4 Documentation](https://www.odata.org/documentation/)

## 💡 总结

**Fiori Elements** 适合快速构建标准应用，而 **Basic Template** 则为需要深度定制的场景提供了完全的控制力。选择哪种方式取决于你的具体需求：

- 需要快速原型？选 Fiori Elements
- 需要深度定制？选 Basic Template
- 想学习 UI5 原理？从 Basic Template 开始！

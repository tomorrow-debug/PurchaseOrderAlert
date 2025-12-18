# SAP Fiori应用部署到SAP Build Work Zone指南

## 📦 部署方案

### 方案一：使用MTA部署到Cloud Foundry（推荐）

#### 前置条件

1. **SAP BTP账号**：具有Cloud Foundry访问权限
2. **SAP Build Work Zone订阅**：在BTP Cockpit中已订阅
3. **安装必要工具**：
   - Node.js (已安装)
   - Cloud Foundry CLI
   - MBT (Multi-Target Application Build Tool)

#### 步骤1: 安装Cloud Foundry CLI

```powershell
# 下载并安装 CF CLI
# 访问: https://github.com/cloudfoundry/cli/releases
# 或使用 chocolatey
choco install cloudfoundry-cli
```

验证安装：
```powershell
cf --version
```

#### 步骤2: 安装MBT工具

```powershell
npm install -g mbt
```

#### 步骤3: 登录到Cloud Foundry

```powershell
# 登录到您的CF环境
cf login -a <API_ENDPOINT>

# 示例：
# cf login -a https://api.cf.eu10.hana.ondemand.com

# 输入邮箱和密码
# 选择组织(Org)和空间(Space)
```

#### 步骤4: 生成MTA配置文件

您的项目需要一个 `mta.yaml` 文件来定义部署结构。我已经为您准备了模板。

#### 步骤5: 创建应用路由配置

需要为每个应用创建 `xs-app.json` 文件。

#### 步骤6: 构建MTA

```powershell
mbt build
```

这会在 `mta_archives` 文件夹中生成一个 `.mtar` 文件。

#### 步骤7: 部署到Cloud Foundry

```powershell
cf deploy mta_archives/<your-app-name>.mtar
```

#### 步骤8: 在Work Zone中配置

1. 打开 SAP BTP Cockpit
2. 进入 Work Zone 管理界面
3. 创建新的Content Package
4. 添加您部署的Fiori应用
5. 配置权限和用户访问

---

### 方案二：使用SAP Business Application Studio部署（更简单）

#### 步骤1: 在BAS中打开项目

1. 登录 SAP Business Application Studio
2. 创建 "SAP Fiori" 类型的Dev Space
3. 克隆或上传您的项目

#### 步骤2: 使用内置部署向导

1. 右键点击项目根目录
2. 选择 "Deploy" > "Deploy to SAP BTP"
3. 按照向导配置：
   - 选择目标 Cloud Foundry 空间
   - 配置应用路由
   - 选择Work Zone集成

#### 步骤3: 配置Work Zone

部署完成后，向导会引导您将应用添加到Work Zone。

---

## 🔧 所需配置文件

### 1. mta.yaml (项目根目录)
多目标应用描述文件，定义应用结构和依赖关系。

### 2. xs-app.json (每个app的webapp目录)
应用路由配置，定义路由规则和认证。

### 3. xs-security.json (可选)
如果需要用户认证和授权。

---

## ⚠️ 常见问题

### 问题1: CF CLI登录失败
**解决方案**: 
- 确认API endpoint正确
- 检查网络连接
- 确认BTP账号权限

### 问题2: MTA构建失败
**解决方案**:
- 检查 mta.yaml 语法
- 确保所有依赖已安装 (`npm install`)
- 查看构建日志获取详细错误

### 问题3: 应用无法在Work Zone显示
**解决方案**:
- 确认应用已成功部署到CF
- 检查 xs-app.json 配置
- 在Work Zone中刷新Content Provider
- 确认用户角色和权限配置正确

---

## 📚 参考资料

- [SAP BTP Documentation](https://help.sap.com/docs/btp)
- [SAP Build Work Zone](https://help.sap.com/docs/build-work-zone-standard-edition)
- [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/)
- [MTA Development](https://www.sap.com/documents/2016/06/e2f618e4-757c-0010-82c7-eda71af511fa.html)

---

## 🎯 下一步

运行以下命令开始部署过程：

```powershell
# 1. 确保在项目根目录
cd "C:\Users\I761807\Desktop\Project_2025\Customized_AI\11-2\purchase_order_alert_page3"

# 2. 构建MTA
mbt build -t mta_archives

# 3. 部署
cf deploy mta_archives/*.mtar
```

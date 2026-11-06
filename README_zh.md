<div align="center">
    <a href="https://github.com/MarSeventh/CloudFlare-ImgBed"><img width="80%" alt="logo" src="readme/banner.png" /></a>
    <p><em>🗂️ 打破图床边界，构建你的专属开源文件托管引擎。</em></p>
    <p>
        <a href="https://github.com/MarSeventh/CloudFlare-ImgBed/blob/main/README_zh.md">简体中文</a> | <a href="https://github.com/MarSeventh/CloudFlare-ImgBed/blob/main/README.md">English</a> | <a href="https://cfbed.sanyue.de">官方网站</a> | <a href="https://t.me/sanyue_club">Telegram 频道</a>
    </p>
    <p align="center">
        <a href="https://github.com/MarSeventh/CloudFlare-ImgBed/blob/main/LICENSE"><img src="https://img.shields.io/github/license/MarSeventh/CloudFlare-ImgBed" alt="License" /></a>
        <a href="https://github.com/MarSeventh/CloudFlare-ImgBed/releases"><img src="https://img.shields.io/github/release/MarSeventh/CloudFlare-ImgBed" alt="latest version" /></a>
        <a href="https://hub.docker.com/r/marseventh/cloudflare-imgbed"><img src="https://img.shields.io/docker/pulls/marseventh/cloudflare-imgbed" alt="Docker Pulls" /></a>
        <a href="https://t.me/sanyue_club"><img src="https://img.shields.io/badge/-Sanyue-26A5E4?logo=telegram&logoColor=white" alt="Telegram Sanyue" /></a>
        <a href="https://github.com/MarSeventh/CloudFlare-ImgBed/stargazers"><img src="https://img.shields.io/github/stars/MarSeventh/CloudFlare-ImgBed" alt="Stars" /></a>
        <a href="https://github.com/MarSeventh/CloudFlare-ImgBed/network/members"><img src="https://img.shields.io/github/forks/MarSeventh/CloudFlare-ImgBed" alt="Forks" /></a>
        <a href="https://atomgit.com/MarSeventh/CloudFlare-ImgBed"><img src="https://atomgit.com/MarSeventh/CloudFlare-ImgBed/star/badge.svg" alt="G-star" /></a>
    </p>
    <p align="center">
        <a href="https://trendshift.io/repositories/14324" target="_blank"><img src="https://trendshift.io/api/badge/repositories/14324" alt="GitHub Trending" width="250" /></a>
        <a href="https://hellogithub.com/repository/MarSeventh/CloudFlare-ImgBed" target="_blank"><img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=71d65ace215945b0909d4c75c31b9fcb&claim_uid=6DsuqF4hInJWerv&theme=neutral" alt="Featured｜HelloGitHub" width="250" /></a>
    </p>
</div>

---

> [!IMPORTANT]
>
> **遇到问题请务必先查看[公告](https://github.com/MarSeventh/CloudFlare-ImgBed/discussions/categories/announcements)和[Telegram频道](https://t.me/sanyue_club)信息，重要通知和非兼容性更新内容均会在公告中说明！**


# 1. 💡 项目介绍

CloudFlare ImgBed 是支持 Docker 与 Serverless 部署的自建图床和文件托管方案，可将 **Telegram**、**Discord**、**Cloudflare R2**、**S3 兼容存储**、**Hugging Face**、**WebDAV** 等渠道统一接入一个管理界面。项目提供文件管理、身份认证、目录组织、内容审核、RESTful API 与 WebDAV，同时也在不断增加 AI 驱动的图片标签识别等个性化能力，适用于个人图床、网站资源管理和轻量文件分发。 **[查看完整功能 →](https://cfbed.sanyue.de/guide/features.html)**

![CloudFlare](readme/海报.png)

## 🤝 合作伙伴

<table width="100%">
  <tr>
    <td align="center" width="16.67%">
      <strong><a href="https://www.cloudflare.com/">Cloudflare</a></strong>
    </td>
    <td align="center" width="16.67%">
      <strong><a href="https://edgeone.ai/?from=github">EdgeOne</a></strong>
    </td>
    <td align="center" width="16.67%">
      <strong><a href="https://www.packyapi.ai/register?aff=u0Ka">PackyCode</a></strong>
    </td>
    <td align="center" width="16.67%">
      <strong><a href="https://www.hncloud.com/activity/activity_2026summer.html?k=MarSeventh">华纳云</a></strong>
    </td>
    <td align="center" width="16.67%">
      <strong><a href="https://www.svyun.com/recommend/AELZ0UeMz8K11Zg7pEXC">速维云</a></strong>
    </td>
    <td align="center" width="16.67%">
      <strong><a href="https://linux.do/t/topic/2578561">Linux DO</a></strong>
    </td>
  </tr>
  <tr>
    <td align="center"><a href="https://www.cloudflare.com/"><img src="readme/partners/cloudflare-logo.png" alt="Cloudflare Logo" height="25"></a></td>
    <td align="center"><a href="https://edgeone.ai/?from=github"><picture><source media="(prefers-color-scheme: dark)" srcset="readme/partners/edgeone-logo-dark.png"><img src="readme/partners/edgeone-logo.png" alt="EdgeOne Logo" height="25"></picture></a></td>
    <td align="center"><a href="https://www.packyapi.ai/register?aff=u0Ka"><picture><source media="(prefers-color-scheme: dark)" srcset="readme/partners/packycode-logo-dark.png"><img src="readme/partners/packycode-logo.png" alt="PackyCode Logo" height="25"></picture></a></td>
    <td align="center"><a href="https://www.hncloud.com/activity/activity_2026summer.html?k=MarSeventh"><picture><source media="(prefers-color-scheme: dark)" srcset="readme/partners/hncloud-logo-dark.png"><img src="readme/partners/hncloud-logo.png" alt="华纳云 Logo" height="25"></picture></a></td>
    <td align="center"><a href="https://www.svyun.com/recommend/AELZ0UeMz8K11Zg7pEXC"><picture><source media="(prefers-color-scheme: dark)" srcset="readme/partners/svyun-logo-dark.png"><img src="readme/partners/svyun-logo.png" alt="速维云 Logo" height="25"></picture></a></td>
    <td align="center"><a href="https://linux.do/t/topic/2578561"><picture><source media="(prefers-color-scheme: dark)" srcset="readme/partners/linuxdo-logo.png"><img src="readme/partners/linuxdo-logo-light.png" alt="Linux DO Logo" height="25"></picture></a></td>
  </tr>
  <tr>
    <td align="center"><sub>提供 CDN 加速及安全防护</sub></td>
    <td align="center"><sub>提供 CDN 加速及安全防护</sub></td>
    <td align="center"><sub>提供稳定、高性价比的顶级大模型 API 服务，一站搞定文案、图片和代码，通过本项目链接注册立享充值折扣与免费额度！</sub></td>
    <td align="center"><sub>提供稳定、优质的云计算资源，通过本项目链接注册立享超值优惠！</sub></td>
    <td align="center"><sub>提供稳定、优质的云计算资源，通过本项目链接注册立享超值优惠！</sub></td>
    <td align="center"><sub>提供社区支持</sub></td>
  </tr>
</table>




# 2. 🖥️ 在线演示

**演示站点**：[CloudFlare ImgBed](https://cfbed.1314883.xyz/) · **访问密码**：`cfbed`

![文件上传页面](readme/upload.png)

<details>
    <summary>其他页面效果展示</summary>

<table>
  <tr>
    <td align="center" width="50%">
      <strong>登录页面</strong><br>
      <img src="readme/login.png" alt="登录页面" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>上传进度</strong><br>
      <img src="readme/uploading.png" alt="上传进度" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>文件管理</strong><br>
      <img src="readme/dashboard.png" alt="文件管理" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>用户管理</strong><br>
      <img src="readme/customer-config.png" alt="用户管理" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>状态页面</strong><br>
      <img src="readme/status-page.png" alt="状态页面" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>公开画廊</strong><br>
      <img src="readme/public-gallery.png" alt="公开画廊" width="100%">
    </td>
  </tr>
</table>

</details>

# 3. 📚 文档与更新

## 📖 项目文档

项目文档涵盖部署方式、存储渠道配置、功能使用、RESTful API、WebDAV、版本升级及常见问题等内容。无论是首次部署还是日常维护，都可以在文档中找到对应的操作说明。

**[查看完整文档 →](https://cfbed.sanyue.de)**

## 📝 更新日志

了解项目的最新功能、问题修复、兼容性变更和升级注意事项。

[![更新日志](https://recent-update.cfbed.sanyue.de/cn)](https://cfbed.sanyue.de/guide/update-log.html)

## 🎬 视频压缩

上传视频时可像图片压缩一样，在「上传设置 → 文件预处理」里开启视频压缩，并选择**压缩率**、**目标文件大小**和**压缩阈值**；压缩结果仍按所选渠道原样保存。图片压缩设置与原有图片上传行为完全不受影响。

### 前端：浏览器本地压缩（默认）

视频压缩**默认在浏览器本地完成**（`MediaRecorder` + `canvas.captureStream` 重新编码），不依赖服务端 ffmpeg，因此 **Cloudflare Workers / Pages 部署同样可用**，不会出现「没有压缩后端」的 503 错误：

- 默认开启，压缩率 75%、压缩阈值 5MB、期望大小 0（只按压缩率）、最大输入 100MB；图片压缩默认阈值 1MB、期望大小 0.8MB，并开启 WebP 转换。
- 动态照片模式的内嵌视频复用同一套浏览器压缩实现，参数来自其独立设置页。
- 浏览器需要支持 `MediaRecorder` 并能解码源视频。无法解码、压缩超时或压缩后体积没有明显下降时，会给出明确提示并**按原文件正常上传**，不会导致上传失败。
- 优先用 **WebCodecs 非实时编码**（`VideoDecoder` / `VideoEncoder` 直接解码再编码，按 CPU 跑满，不必等视频播放完，短视频通常 1–3 秒完成）；浏览器不支持 WebCodecs 或源视频不是 H.264/AAC MP4 时，自动回退 `MediaRecorder` 实时录制。未预设时长/体积门槛，仅保留防止异常挂起的安全上限。音频为 AAC-LC 时直接复用原始样本，不重编码。

### 后端：服务端转码（可选，供直接调用 `/upload` API 使用）

前端已不再发送 `videoCompress` 参数。以下能力保留给脚本、同步工具等直接调用上传 API 的场景。若之前曾为了配合旧版在管理后台把 `videoCompression.enabled` 设为 `true`，而部署端又没有 ffmpeg 或外部转码服务，请改回 `false`——浏览器本地压缩不需要这个开关：

| 部署方式 | 压缩引擎 | 说明 |
| --- | --- | --- |
| Docker / Node | 镜像内置 ffmpeg + ffprobe | 设置 `VIDEO_COMPRESS_ENABLED=true`，无需额外服务 |
| Cloudflare Workers / Pages | 外部 ffmpeg 转码服务 | 配置 `VIDEO_COMPRESS_ENDPOINT`（POST 原始视频字节，返回压缩后视频字节） |

常用环境变量（也可在「管理后台 → 上传设置」的 `videoCompression` 节点配置）：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VIDEO_COMPRESS_ENABLED` | `false` | 总开关（仅对直接调用 API 且未带 URL 参数的请求生效） |
| `VIDEO_COMPRESS_QUALITY` | `70` | 画质 0–100，越大画质越好、体积越大 |
| `VIDEO_COMPRESS_TARGET_SIZE_MB` | `0` | 目标大小(MB)，0 表示只按画质压缩 |
| `VIDEO_COMPRESS_MAX_INPUT_MB` | `100` | 输入上限，超出返回 413 |
| `VIDEO_COMPRESS_FORMAT` | `mp4` | 输出格式 `mp4` / `webm` |
| `VIDEO_COMPRESS_ENDPOINT` / `VIDEO_COMPRESS_TOKEN` | 空 | Workers 部署的外部转码服务与令牌 |
| `VIDEO_COMPRESS_TIMEOUT_MS` | `600000` | 单次转码超时 |

单次上传可用 URL 参数覆盖：`videoCompress`、`videoQuality`、`videoTargetSizeMB`、`videoMaxInputMB`、`videoFormat`。

支持输入：`mp4 / m4v / mov / webm / mkv / avi`。不支持的格式返回 415、超过输入上限返回 413、转码失败或超时返回 502/504，且**不会把未压缩的原文件偷偷上传**；压缩后反而更大时自动使用原文件。

服务端转码的限制：需要完整文件，因此仅支持直传（非分块）上传；Workers/Pages 还受 100MB 请求体限制。这些限制**不影响前端浏览器本地压缩**——本地压缩后的文件按普通流程上传，大文件仍可走分块上传。

### 动态照片模式

切换到「动态照片上传」模式后，上传设置会打开**专用设置页**，其中「封面图片压缩」与「内嵌视频压缩」是两个相互独立的分区：

- **封面图片压缩**：默认开启（阈值 1MB、期望大小 0.8MB、不转 WebP）；关闭后封面原样上传，各参数均可调整。
- **内嵌视频压缩**：默认开启（压缩率 70%、期望大小 0、最大边长 1280px），在浏览器本地用 `MediaRecorder` 重新编码 MP4/MOV 动态片段，无需服务端 ffmpeg；各参数均可调整。

这两组设置只在动态照片模式生效，不会读取或改写普通上传模式的「文件预处理」设置；两种模式的视频压缩都在浏览器本地完成，都不需要服务端 ffmpeg。

# 4. 🌱 项目生态

欢迎前往 [CloudFlare ImgBed 生态](https://cfbed.sanyue.de/about/ecosystem.html)，探索社区提供的扩展、应用和教程，包括：

- **优秀的插件扩展**：浏览器扩展，Typecho、WordPress、Obsidian 等平台的集成插件，OpenList 驱动等
- **丰富的周边应用**：桌面客户端、Bot 辅助工具等
- **AI 智能体应用**：项目官方 Skill 及相关工具
- **优质的教程内容**：内容创作者分享的优质视频和图文教程

您也可以向社区分享自己的作品，提交规范请参见[生态建设征集令](https://github.com/MarSeventh/CloudFlare-ImgBed/discussions/606)，期待您的参与！

# 5. 💝 支持与赞助

## ☕ 支持项目

开源项目的维护需要持续投入时间和精力。如果 CloudFlare ImgBed 对您有所帮助，欢迎支持项目持续发展。

<p align="center">
  <a href="https://afdian.com/a/marseventh"><img src="https://img.shields.io/badge/爱发电-946CE6?style=for-the-badge&logo=afdian&logoColor=white" height="36" alt="通过爱发电支持"></a>
  &nbsp;&nbsp;
  <a href="readme/weixin-reward.png"><img src="https://img.shields.io/badge/微信赞赏-07C160?style=for-the-badge&logo=wechat&logoColor=white" height="36" alt="通过微信赞赏支持"></a>
</p>

## 💖 赞助者

感谢每一位赞助者对本项目的支持！您的支持帮助项目持续维护，也为 CloudFlare ImgBed 的长期改进提供动力。

[![赞助者](https://afdian-sponsors.sanyue.de/image?columns=12)](https://afdian.com/a/marseventh)

# 6. 👥 项目社区

## 🧑‍💻 贡献者

感谢所有为项目贡献代码、文档、创意和反馈的开发者！

参与前请阅读[贡献指南](CONTRIBUTING.md)（英文），了解仓库分工、PR 目标分支、代码约定和验证要求。

[![贡献者](https://contrib.rocks/image?repo=Marseventh/Cloudflare-ImgBed)](https://github.com/MarSeventh/CloudFlare-ImgBed/graphs/contributors)

## ⭐ Star 趋势

**如果这个项目对您有所帮助，欢迎点亮一个 Star ⭐，感谢您的支持！**

<a href="https://github.com/MarSeventh/CloudFlare-ImgBed">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=marseventh%2Fcloudflare-imgbed%2Cmarseventh/sanyue-imghub&amp;type=Date&amp;theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=marseventh%2Fcloudflare-imgbed%2Cmarseventh/sanyue-imghub&amp;type=Date" />
   <img alt="Star-History" src="https://api.star-history.com/svg?repos=marseventh%2Fcloudflare-imgbed%2Cmarseventh/sanyue-imghub&amp;type=Date" />
 </picture>
</a>

# 7. ⚖️ 开源协议与相关项目

## 📄 开源协议

> [!IMPORTANT]
> 本项目基于 [MIT License](LICENSE) 开源。您可以自由使用、修改和分发本项目，但须在软件的所有副本或重要部分中保留原始版权及许可声明。

## 🔗 相关开源项目

- **Web 前端**：[MarSeventh/Sanyue-ImgHub](https://github.com/MarSeventh/Sanyue-ImgHub)
- **桌面客户端**：[MarSeventh/satellite](https://github.com/MarSeventh/satellite)
- **上游项目**：[cf-pages/Telegraph-Image](https://github.com/cf-pages/Telegraph-Image)

CloudFlare ImgBed 由 Telegraph-Image 发展而来，感谢原项目作者及所有贡献者。

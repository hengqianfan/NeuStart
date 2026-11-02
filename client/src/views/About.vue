<template>
    <section class="about">
        <!-- ===== Hero ===== -->
        <header class="about__hero">
            <span class="about__badge">
                <i class="iconfont icon-bulb" aria-hidden="true" />
                <span>关于本站</span>
            </span>



            <h1 class="about__title">

                NeuStart

                <img src="/icons/neustart.png" alt="" class="logo">


            </h1>



            <p class="about__desc">
                这是我的个人起始页站点，建站的原因很简单，我心目中的完美博客感觉还得打磨很长一段时间，所以在此期间，我用 NeuStart 作为过渡，之后，它也将成为我各个创作项目之间互通的空间节点。

                <br />

                <br>

                网站主要导向三大模块：
                <br />
                ① <strong>关联我的网络平台账户</strong>，例如 Github 和 哔哩哔哩 等自媒体平台。
                （ 通过主页的翻转卡片可以查看 ）
                <br />

                ② <strong>我的网址库</strong>，这是大多数起始页网站的本职工作。
                <br />

                ③ <strong>我的项目</strong>，例如：知识库笔记、博客项目、小程序项目。

                <br />
                <br />


                🎉 在此感谢 DeepSeek-v4.1-flash 和 Workbuddy 提供的技术支持，让我在极短时间内搭建出了 NeuStart 。

            </p>
        </header>

        <div class="about__inner">
            <!-- ===== 时间线 ===== -->
            <section class="card" aria-labelledby="time-title">
                <h2 id="time-title" class="card__title">
                    <i class="iconfont icon-nav" aria-hidden="true" />
                    站点历史
                </h2>

                <ol class="timeline">
                    <li v-for="(item, index) in timeline" :key="item.date" class="timeline__item"
                        :class="{ 'is-latest': index === 0 }">
                        <span class="timeline__dot" aria-hidden="true" />
                        <time class="timeline__date">{{ item.date }}</time>
                        <div class="timeline__content">
                            <h3 class="timeline__title">{{ item.title }}</h3>
                            <p class="timeline__text">{{ item.text }}</p>
                        </div>
                    </li>
                </ol>
            </section>
        </div>
    </section>
</template>

<script lang="ts" setup>
const timeline = [
    { date: '2026-11-02', title: '站点部署', text: '项目基本功能已实现，部署到 GitHub Pages' },

    { date: '2026-10-30', title: '站点初建', text: '参考原博客项目 Hone 的样式分离重建本站 NeuStart' },




]
</script>

<style lang="scss" scoped>
.logo {
    width: 50px;
    height: 50px;
    background-color: white;
    border-radius: 50%;
    // margin: 10px 0;
    // display: inline-block;
}

/* ===== 主题变量（黑透） ===== */
.about {
    --a-text: #e8eefc;
    --a-dim: #9aa4b4;
    --a-card: rgba(10, 12, 16, 0.6);
    --a-border: rgba(255, 255, 255, 0.14);
    --a-border-strong: rgba(255, 255, 255, 0.4);
    --a-hl: #ffffff;

    position: relative;
    z-index: 1;
    box-sizing: border-box;
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
    padding: 48px 24px 72px;
    color: var(--a-text);
    font-size: 14px;
    line-height: 1.75;


    strong {
        font-weight: 800;
        color: white;

        letter-spacing: 0.5px;
    }
}

/* ===== Hero ===== */
.about__hero {
    position: relative;
    padding: 30px;
    border: 1px solid var(--a-border);
    border-radius: 18px;
    background: var(--a-card);
    backdrop-filter: blur(16px);
}

.about__badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.78);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--a-border);
    border-radius: 999px;

    i {
        font-size: 12px;
    }
}

.about__title {
    margin: 16px 0 12px;
    font-size: clamp(26px, 4vw, 38px);
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.5px;
    display: flex;
    align-items: end;
    gap: 12px;
}

.about__hl {
    background: linear-gradient(92deg, #ffffff 0%, #d6dae2 60%, #9aa4b4 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.about__desc {
    max-width: 90%;
    margin: 0;
    color: var(--a-dim);
    font-size: 14px;
}

/* ===== 通用卡片 ===== */
.about__inner {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
}

.card {
    padding: 30px;
    border: 1px solid var(--a-border);
    border-radius: 16px;
    background: var(--a-card);
    backdrop-filter: blur(16px);
}

.card__title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 18px;
    font-size: 16px;
    font-weight: 600;
    color: var(--a-text);

    i {
        font-size: 15px;
        color: rgba(255, 255, 255, 0.75);
    }
}

/* ===== 时间线 ===== */
.timeline {
    position: relative;
    margin: 0;
    padding: 0 0 0 20px;

    list-style: none;

    &::before {
        content: '';
        position: absolute;
        top: 6px;
        bottom: 6px;
        left: 4px;
        width: 1px;
        background: linear-gradient(180deg, var(--a-border-strong), transparent);
    }
}

.timeline__item {
    position: relative;
    padding: 0 0 20px 18px;

    &:last-child {
        padding-bottom: 0;
    }
}

.timeline__dot {
    position: absolute;
    top: 7px;
    left: -20px;
    width: 9px;
    height: 9px;
    background: rgba(255, 255, 255, 0.35);
    border-radius: 50%;
}

.timeline__item.is-latest .timeline__dot {
    background: #fff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

.timeline__date {
    display: block;
    margin-bottom: 3px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 0.5px;
}

.timeline__title {
    margin: 0 0 4px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--a-text);
}

.timeline__text {
    margin: 0;
    font-size: 13px;
    color: var(--a-dim);
}

/* ===== 响应式 ===== */
@media (max-width: 720px) {
    .about {
        padding: 28px 16px 56px;
        padding-top: 70px;
    }

    .about__hero {
        padding: 26px 20px;
    }

    .card {
        padding: 20px 18px;
    }
}
</style>
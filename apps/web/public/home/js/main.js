(function($) {
    'use strict';

    // 初始化AOS动画库
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // 初始化Swiper轮播
    const heroSwiper = new Swiper('.hero-swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        }
    });

    // 导航栏滚动效果
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 50) {
            $('.nav').addClass('nav-scrolled');
        } else {
            $('.nav').removeClass('nav-scrolled');
        }
    });

    // 平滑滚动
    $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(event) {
        if (
            location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
            && 
            location.hostname == this.hostname
        ) {
            let target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top - 80
                }, 800);
                return false;
            }
        }
    });

    // 返回顶部按钮
    const backToTop = $('#backToTop');
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            backToTop.addClass('visible');
        } else {
            backToTop.removeClass('visible');
        }
    });

    backToTop.on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({scrollTop: 0}, 800);
    });

    // 在线客服
    $('.cs-btn').on('click', function() {
        // 这里可以集成您的在线客服系统
        console.log('打开在线客服');
    });

    // 表单提交处理
    $('#contactForm').on('submit', function(e) {
        e.preventDefault();
        const formData = {
            name: $('input[name="name"]').val(),
            email: $('input[name="email"]').val(),
            phone: $('input[name="phone"]').val(),
            message: $('textarea[name="message"]').val()
        };

        // 表单验证
        if (!validateForm(formData)) {
            return false;
        }

        // 发送表单数据
        $.ajax({
            url: '/api/contact',
            type: 'POST',
            data: formData,
            success: function(response) {
                showMessage('success', '消息已发送，我们会尽快与您联系！');
                $('#contactForm')[0].reset();
            },
            error: function(xhr, status, error) {
                showMessage('error', '发送失败，请稍后重试！');
            }
        });
    });

    // 下载按钮点击统计
    $('.download-btns a').on('click', function(e) {
        const platform = $(this).data('platform');
        const version = $(this).data('version');
        
        // 发送下载统计数据
        $.post('/api/download-stats', {
            platform: platform,
            version: version
        });
    });

    // 懒加载图片
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // 工具函数：表单验证
    function validateForm(data) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^1[3456789]\d{9}$/;

        if (!data.name.trim()) {
            showMessage('error', '请输入您的姓名！');
            return false;
        }

        if (!emailRegex.test(data.email)) {
            showMessage('error', '请输入正确的邮箱地址！');
            return false;
        }

        if (!phoneRegex.test(data.phone)) {
            showMessage('error', '请输入正确的手机号码！');
            return false;
        }

        if (!data.message.trim()) {
            showMessage('error', '请输入留言内容！');
            return false;
        }

        return true;
    }

    // 工具函数：显示消息提示
    function showMessage(type, message) {
        const messageDiv = $('<div>').addClass('message ' + type).text(message);
        $('body').append(messageDiv);

        setTimeout(() => {
            messageDiv.addClass('show');
        }, 100);

        setTimeout(() => {
            messageDiv.removeClass('show');
            setTimeout(() => {
                messageDiv.remove();
            }, 300);
        }, 3000);
    }

    // 性能优化：防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 性能优化：节流函数
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // 添加页面加载完成动画
    $(window).on('load', function() {
        $('.loader').fadeOut('slow');
        $('body').addClass('loaded');
    });

    // 移动端菜单
    $('.mobile-menu-btn').on('click', function() {
        $('.nav-links').toggleClass('active');
        $(this).toggleClass('active');
    });

    // 响应式视频容器
    $('.video-container').each(function() {
        const container = $(this);
        const aspectRatio = container.data('aspect-ratio') || 0.5625; // 16:9
        
        function resizeVideo() {
            const width = container.width();
            container.height(width * aspectRatio);
        }

        resizeVideo();
        $(window).on('resize', debounce(resizeVideo, 250));
    });

    // 初始化工具提示
    $('[data-tooltip]').each(function() {
        const element = $(this);
        const tooltip = element.data('tooltip');
        
        element.on('mouseenter', function() {
            const tooltipEl = $('<div>').addClass('tooltip').text(tooltip);
            element.append(tooltipEl);
            
            setTimeout(() => tooltipEl.addClass('show'), 10);
        }).on('mouseleave', function() {
            const tooltipEl = element.find('.tooltip');
            tooltipEl.removeClass('show');
            setTimeout(() => tooltipEl.remove(), 200);
        });
    });

    // 页面离开提醒
    let formChanged = false;
    $('#contactForm').on('change', 'input, textarea', function() {
        formChanged = true;
    });

    window.onbeforeunload = function() {
        if (formChanged) {
            return '您填写的表单尚未提交，确定要离开吗？';
        }
    };

    // 初始化页面
    function init() {
        // 检查浏览器支持
        checkBrowserSupport();
        // 加载用户偏好设置
        loadUserPreferences();
        // 初始化统计
        initAnalytics();
    }

    // 检查浏览器支持
    function checkBrowserSupport() {
        const unsupportedFeatures = [];

        if (!('IntersectionObserver' in window)) {
            unsupportedFeatures.push('IntersectionObserver');
        }

        if (!('fetch' in window)) {
            unsupportedFeatures.push('Fetch API');
        }

        if (unsupportedFeatures.length > 0) {
            console.warn('您的浏览器不支持以下特性：', unsupportedFeatures.join(', '));
        }
    }

    // 加载用户偏好设置
    function loadUserPreferences() {
        const preferences = localStorage.getItem('userPreferences');
        if (preferences) {
            try {
                const { theme, fontSize } = JSON.parse(preferences);
                if (theme) document.body.setAttribute('data-theme', theme);
                if (fontSize) document.body.style.fontSize = fontSize;
            } catch (e) {
                console.error('加载用户偏好设置失败：', e);
            }
        }
    }

    // 初始化统计
    function initAnalytics() {
        // 页面访问统计
        const pageData = {
            path: window.location.pathname,
            referrer: document.referrer,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString()
        };

        // 发送统计数据
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pageData)
        }).catch(console.error);
    }

    // 启动初始化
    init();

})(jQuery);

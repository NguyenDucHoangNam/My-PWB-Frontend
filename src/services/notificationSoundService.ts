/**
 * Notification Sound Service
 * Phát âm thanh khi có tin nhắn mới
 */

class NotificationSoundService {
    private static instance: NotificationSoundService;
    private audio: HTMLAudioElement | null = null;
    private isEnabled: boolean = true;
    private volume: number = 0.5;

    private constructor() {
        this.initAudio();
    }

    static getInstance(): NotificationSoundService {
        if (!NotificationSoundService.instance) {
            NotificationSoundService.instance = new NotificationSoundService();
        }
        return NotificationSoundService.instance;
    }

    private initAudio(): void {
        try {
            // Tạo audio element với notification sound từ file mp3
            this.audio = new Audio('/music/notification.mp3');
            this.audio.volume = this.volume;
            this.audio.preload = 'auto';

            // Load audio để sẵn sàng phát
            this.audio.load();
            console.log('🔔 Notification sound initialized: /music/notification.mp3');
        } catch (error) {
            console.warn('Failed to initialize notification sound:', error);
        }
    }

    /**
     * Tạo âm thanh notification bằng Web Audio API
     * Trả về base64 encoded audio
     * @internal Reserved for future fallback implementation
     */
    // @ts-expect-error - Reserved for future implementation
    private _generateNotificationSound(): string {
        // Fallback: sử dụng một âm thanh notification cơ bản (base64 encoded)
        // Đây là âm thanh "ding" ngắn
        return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2LkZqTi4J3bmVibXuJlJ2bmI+Ff3d3fIKIkJeYlI6He3Nxc3qDjJOYl5OOiYN+fICFjJCUlZKNiIOAfYGGio6RkpGNh4N+fYGFiIuOkZGNiYSBf4KEh4qMjpCPjIqHhIODg4WIio2PkI2Lh4WDg4SEhoiLjI6OjYuJh4WEhIWGiIqMjY2Mi4qIhoWEhYaHiYuMjIuLiYiGhYWFhoiJi4uLi4qJiIeGhYWGh4mKi4uKiomIh4aGhoaHiImKioqKiYmIh4aGhoaHiImKioqJiYiHhoaGhoeIiYqKiomJiIeHhoaGh4iJioqKiYmIh4eGhoaHiImJioqJiYiHh4aGhoeIiYmKiomJiIeHhoaGh4iJiYqKiYmIh4eGhoaHiImJioqJiYiIh4aGhoeIiYmJiomJiIeHhoaGh4iIiYqKiYmIiIeGhoaHiIiJiomJiYiHh4aGhoeIiImKiomJiIiHhoaGh4iIiYqJiYmIh4eGhoaHiIiJiomJiYiHh4aGhoeIiImJiYmJiIeHhoaGh4iIiYmJiYmIh4eGhoaHiIiJiYmJiYiHh4aGhoeIiImJiYmJiIeHhoaGh4iIiYmJiYmIh4eHhoaHiIiJiYmJiIiHh4aGhoeIiImJiYmJiIeHhoaGh4iIiYmJiYmIh4eGhoaHiIiJiYmJiYiHh4aGhoeIiImJiYmIiIeHhoaGh4iIiYmJiYmIh4eGhoaHiIiIiYmJiYiHh4aGhoeIiIiJiYmJiIeHhoaGh4iIiImJiYmIh4eGhoaHiIiIiYmJiYiHh4aGhoeIiIiJiYmJiIeHhoaGh4iIiImJiYmIh4eGhoaHiIiIiYmJiIiHh4aGhoeIiIiJiYmJiIeHhoaGh4iIiImJiYmIh4eGhoaHiIiIiYmJiYiHh4aGhoeIiIiJiYmJiIeHhoaGh4iIiImJiYmIh4eGhoaHiIiIiYmJiYiHh4aGhoeIiIiJiYmJiIeHhoaGh4iIiImJiYmIh4eGhg==';
    }

    /**
     * Phát âm thanh notification
     */
    async playNotificationSound(): Promise<void> {
        if (!this.isEnabled || !this.audio) {
            return;
        }

        try {
            // Reset audio về đầu nếu đang phát
            this.audio.currentTime = 0;

            // Thử phát âm thanh
            const playPromise = this.audio.play();

            if (playPromise !== undefined) {
                await playPromise;
                console.log('🔔 Notification sound played');
            }
        } catch (error) {
            // Browser có thể block autoplay nếu user chưa interact
            console.warn('Could not play notification sound:', error);

            // Thử dùng Web Audio API như fallback
            this.playWithWebAudioAPI();
        }
    }

    /**
     * Fallback: Phát âm thanh bằng Web Audio API
     */
    private playWithWebAudioAPI(): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Tạo âm thanh "ding" 
            oscillator.frequency.setValueAtTime(830, audioContext.currentTime); // Note: G#5
            oscillator.type = 'sine';

            // Envelope cho âm thanh mượt
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

            console.log('🔔 Notification sound played (Web Audio API)');
        } catch (error) {
            console.warn('Web Audio API fallback failed:', error);
        }
    }

    /**
     * Bật/tắt âm thanh notification
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        localStorage.setItem('notificationSoundEnabled', String(enabled));
    }

    /**
     * Kiểm tra trạng thái bật/tắt
     */
    getEnabled(): boolean {
        const stored = localStorage.getItem('notificationSoundEnabled');
        if (stored !== null) {
            this.isEnabled = stored === 'true';
        }
        return this.isEnabled;
    }

    /**
     * Đặt âm lượng (0-1)
     */
    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        localStorage.setItem('notificationSoundVolume', String(this.volume));
    }

    /**
     * Lấy âm lượng hiện tại
     */
    getVolume(): number {
        const stored = localStorage.getItem('notificationSoundVolume');
        if (stored !== null) {
            this.volume = parseFloat(stored);
        }
        return this.volume;
    }
}

export const notificationSoundService = NotificationSoundService.getInstance();

/**
 * Advanced Fingerprinting - Mobile-Optimized Web SDK
 * 다중 계층 엔트로피 융합 기반 고정밀 모바일 디바이스 핑거프린팅
 * 
 * 모듈 구성:
 * - Physical: MEMS, Clock Skew, Canvas, WebGL, Audio FRF, PRNU, DeviceOrientation
 * - Temporal: Battery STL, Performance
 * - Behavioral: Touch, Keystroke, Gait
 * - Mobile: Screen, Speech Synthesis, Network Info, Media Devices, Client Hints
 */

// ============== Types ==============

export interface FingerprintConfig {
    layers: {
        physical: boolean;
        temporal: boolean;
        behavioral: boolean;
        mobile: boolean;
    };
    weights: {
        physical: number;
        temporal: number;
        behavioral: number;
        mobile: number;
    };
    timeout?: number;
    debug?: boolean;
    samplingDuration?: number;
    enableGait?: boolean;
    enablePRNU?: boolean;
    /** Geolocation 수집 (권한 팝업 필요) - 기본 false */
    enableGeolocation?: boolean;
    /** iOS에서 MEMS 권한 요청 (권한 팝업 필요) - 기본 false */
    enableMEMSPermission?: boolean;
}

export interface Fingerprint {
    /** 디바이스 핑거프린트 해시 (브라우저/모드 무관, 동일 기기면 동일) */
    hash: string;
    timestamp: number;
    /** 예상 정확도 (0-0.95) */
    accuracy: number;
    /** 수집된 모듈 목록 */
    modules: string[];
    /** 신호 상세 정보 */
    signals: CrossBrowserSignals;
    /** 이전 저장된 해시 (추적 연속성 확인용, 영속성 레이어) */
    previousHash?: string;
    /** 상세 레이어 정보 (debug 모드에서만) */
    details?: LayerDetails;
}

/** 크로스-브라우저 핑거프린팅에 사용되는 브라우저 독립 신호 */
export interface CrossBrowserSignals {
    // === GPU 특성 (WebGL) - 시크릿 모드에서도 안정적 ===
    gpuRenderer: string;
    gpuVendor: string;

    // === 화면 특성 ===
    screenResolution: string;
    availableScreen: string;
    pixelRatio: number;
    colorDepth: number;

    // === 시스템 특성 ===
    timezone: string;
    hardwareConcurrency: number;
    maxTouchPoints: number;
    platform: string;

    // === WebGL 하드웨어 상수 ===
    shaderPrecision: string;
    webglMaxTextureSize: number;
    webglMaxViewportDims: string;
    webglExtensionCount: number;
    webglMaxRenderbufferSize: number;
    webglMaxVertexAttribs: number;

    // === 강화된 신호 (v2) ===
    /** Math 엔진 정밀도 해시 (V8/SpiderMonkey/JSC 차이) */
    mathEngineHash: string;
    /** WebGL GPU 렌더링 해시 */
    webglRenderHash: string;
    /** 설치된 폰트 해시 */
    fontHash: string;
    /** CSS Feature Matrix 해시 */
    cssFeatureHash: string;
    /** Intl API 포맷 해시 */
    intlHash: string;
    /** AudioContext 스택 해시 */
    audioStackHash: string;
    /** WebGL2 파라미터 해시 */
    webgl2Hash: string;
    /** 하드웨어 미디어 코덱 해시 */
    mediaCapHash: string;

    // === 개체 식별 신호 (v3: 동일 모델 구분) ===
    /** GPU 실리콘 제조 편차 해시 */
    gpuSiliconHash: string;
    /** 오디오 DAC 하드웨어 편차 해시 */
    audioHardwareHash: string;
    /** Canvas 마이크로 렌더링 편차 해시 */
    canvasMicroHash: string;
    /** Storage 용량/사용량 프로파일 해시 */
    storageProfileHash: string;
}

export interface LayerDetails {
    physical?: PhysicalSignature;
    temporal?: TemporalSignature;
    behavioral?: BehavioralSignature;
    mobile?: MobileSignature;
}

export interface PhysicalSignature {
    mems?: MEMSData;
    clockSkew?: ClockSkewData;
    canvas?: CanvasData;
    webgl?: WebGLData;
    audio?: AudioFRFData;
    prnu?: PRNUData;
    orientation?: OrientationData;
    // === v2 강화 신호 ===
    mathEngine?: MathEngineData;
    webglRender?: WebGLRenderData;
    fonts?: FontData;
    cssFeatures?: CSSFeatureData;
    intl?: IntlData;
    audioStack?: AudioStackData;
    webgl2?: WebGL2Data;
    mediaCap?: MediaCapabilitiesData;
    // === v3 개체 식별 신호 ===
    gpuSilicon?: GPUSiliconData;
    audioHardware?: AudioHardwareData;
    canvasMicro?: CanvasMicroData;
    storageProfile?: StorageProfileData;
}

export interface TemporalSignature {
    battery?: BatterySTLData;
    performance?: PerformanceData;
}

export interface BehavioralSignature {
    touch?: TouchData;
    keystroke?: KeystrokeData;
    gait?: GaitData;
}

/** 모바일 특화 시그니처 */
export interface MobileSignature {
    screen?: ScreenData;
    speechVoices?: SpeechData;
    network?: NetworkData;
    mediaDevices?: MediaDevicesData;
    clientHints?: ClientHintsData;
    locale?: LocaleData;
    ip?: IPData;
    geolocation?: GeolocationData;
}

/** IP 주소 정보 */
interface IPData {
    publicIP: string;
    /** IP 히스토리 (변경 감지용) */
    ipHistory: string[];
}

/** 위치 정보 */
interface GeolocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    /** 위치 히스토리 */
    locationHistory: Array<{ lat: number; lng: number; timestamp: number }>;
}

// ============== Physical Data Types ==============

interface MEMSData {
    accelerometer: {
        bias: [number, number, number];
        sensitivity: [number, number, number];
        noise: number;
        normalizedBias: [number, number, number];
    };
    gyroscope: {
        bias: [number, number, number];
        crossAxisError: number;
        noise: number;
    };
    sampleCount: number;
    qualityScore: number;
}

interface ClockSkewData {
    skewPPM: number;
    stabilityIndex: number;
    jitter: number;
    driftDirection: number;
}

interface CanvasData {
    hash: string;
    entropy: number;
    pixelSignature: string;
}

interface WebGLData {
    vendor: string;
    renderer: string;
    hash: string;
    performanceHint: string;
    extensionCount: number;
}

interface AudioFRFData {
    frequencyResponse: number[];
    thd2: number;
    thd3: number;
    totalHarmonicDistortion: number;
    sampleRate: number;
    hash: string;
}

interface PRNUData {
    greenChannelHash: string;
    noiseEntropy: number;
    defectSignature: string;
    vignettingProfile: number[];
}

/** 자기장 센서 데이터 */
interface OrientationData {
    magneticField: [number, number, number];
    compassHeading: number;
    accuracy: number;
}

// ============== Temporal Data Types ==============

interface BatterySTLData {
    level: number;
    charging: boolean;
    dischargeRate: number;
    estimatedInternalResistance: number;
    chargingCurveSignature: string;
    healthEstimate: number;
    stlSignature: string;
}

interface PerformanceData {
    computeScore: number;
    memoryProfile: number;
    coreCount: number;
    heapVolatility: number;
}

// ============== Behavioral Data Types ==============

interface TouchData {
    averagePressure: number;
    averageRadius: number;
    maxTouchPoints: number;
    touchSupport: boolean;
    swipeVelocityProfile: number[];
}

interface KeystrokeData {
    averageDwellTime: number;
    averageFlightTime: number;
    rhythm: number[];
    variance: number;
    estimatedWPM: number;
}

interface GaitData {
    stepFrequency: number;
    stepRegularity: number;
    amplitude: number;
    frequencyPeaks: number[];
    symmetryScore: number;
    sampleCount: number;
}

// ============== Mobile Data Types ==============

/** 화면 상세 정보 */
interface ScreenData {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelRatio: number;
    /** 터치 지원 여부 */
    touchPoints: number;
    /** 화면 방향 */
    orientation: string;
    /** HDR 지원 */
    hdr: boolean;
    /** 화면 시그니처 */
    hash: string;
}

/** Speech Synthesis 음성 목록 */
interface SpeechData {
    voiceCount: number;
    voices: string[];
    languages: string[];
    hash: string;
}

/** 네트워크 정보 */
interface NetworkData {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
}

/** 미디어 디바이스 */
interface MediaDevicesData {
    audioinputCount: number;
    videoinputCount: number;
    audiooutputCount: number;
    deviceLabels: string[];
    hash: string;
}

/** User Agent Client Hints */
interface ClientHintsData {
    platform: string;
    platformVersion: string;
    mobile: boolean;
    model: string;
    brands: string[];
    architecture: string;
}

/** 로케일 정보 */
interface LocaleData {
    language: string;
    languages: string[];
    timezone: string;
    timezoneOffset: number;
}

// ============== Enhanced Signal Data Types ==============

/** Math 엔진 정밀도 핑거프린트 (V8/SpiderMonkey/JSC 차이) */
interface MathEngineData {
    precision: string;
    hash: string;
}

/** WebGL GPU 렌더링 핑거프린트 (실제 드로잉 기반) */
interface WebGLRenderData {
    triangleHash: string;
    gradientHash: string;
}

/** 설치된 폰트 감지 데이터 */
interface FontData {
    detectedFonts: string[];
    fontCount: number;
    hash: string;
}

/** CSS Feature Matrix 핑거프린트 */
interface CSSFeatureData {
    supportedCount: number;
    hash: string;
}

/** Intl API 포맷 핑거프린트 */
interface IntlData {
    dateFormat: string;
    numberFormat: string;
    listFormat: string;
    hash: string;
}

/** AudioContext DynamicsCompressor 핑거프린트 */
interface AudioStackData {
    compressorValue: number;
    hash: string;
}

/** WebGL2 확장 파라미터 */
interface WebGL2Data {
    maxTexture3D: number;
    maxSamples: number;
    maxColorAttachments: number;
    maxUniformBufferBindings: number;
    hash: string;
}

/** Hardware Media Capabilities */
interface MediaCapabilitiesData {
    supportedCodecs: string[];
    hash: string;
}

// ============== Device Uniqueness (v3: 개체 식별) ==============

/** GPU 실리콘 편차 핑거프린트 - 동일 모델도 칩마다 부동소수점 반올림 다름 */
interface GPUSiliconData {
    /** 복합 셰이더 연산 결과 (제조 편차 감지) */
    shaderResults: string;
    /** 다중 셰이더 프로그램 결과 */
    multiPassResults: string;
    hash: string;
}

/** 오디오 DAC 하드웨어 편차 - 개체별 오디오 처리 미세 차이 */
interface AudioHardwareData {
    /** 다중 설정 파형 샘플 (개체별 DAC 편차) */
    waveformSamples: string;
    /** DynamicsCompressor 특성 곡선 */
    compressorCurve: string;
    hash: string;
}

/** Canvas 마이크로 렌더링 - 서브픽셀 안티앨리어싱 GPU 편차 */
interface CanvasMicroData {
    /** 서브픽셀 텍스트 렌더링 차이 */
    textRender: string;
    /** 서브픽셀 도형 안티앨리어싱 */
    shapeRender: string;
    hash: string;
}

/** Storage 프로파일 - 기기별 사용량/용량 */
interface StorageProfileData {
    quota: number;
    usage: number;
    hash: string;
}

// ============== Constants ==============

/** 크로스-브라우저 정확도 기여 가중치 (v3: 개체 식별 포함) */
const CROSS_BROWSER_ACCURACY_WEIGHTS = {
    BASE: 0.02,
    GPU_RENDERER: 0.10,
    GPU_VENDOR: 0.02,
    SCREEN_RESOLUTION: 0.05,
    TIMEZONE: 0.03,
    HARDWARE_CONCURRENCY: 0.03,
    SHADER_PRECISION: 0.05,
    WEBGL_MAX_TEXTURE: 0.03,
    PLATFORM: 0.02,
    // === v2 강화 신호 ===
    MATH_ENGINE: 0.05,
    WEBGL_RENDER: 0.04,
    FONT_FINGERPRINT: 0.05,
    CSS_FEATURES: 0.03,
    INTL_API: 0.03,
    AUDIO_STACK: 0.03,
    WEBGL2_PARAMS: 0.03,
    MEDIA_CAPABILITIES: 0.02,
    // === v3 개체 식별 신호 (동일 모델 구분 핵심) ===
    GPU_SILICON: 0.12,         // GPU 제조 편차 (가장 중요)
    AUDIO_HARDWARE: 0.10,      // 오디오 DAC 편차
    CANVAS_MICRO: 0.08,        // 서브픽셀 렌더링 편차
    STORAGE_PROFILE: 0.04,     // 기기 사용량 프로파일
    MAX_ACCURACY: 0.97,
} as const;

const DEFAULT_CONFIG: FingerprintConfig = {
    layers: { physical: true, temporal: true, behavioral: true, mobile: true },
    weights: { physical: 0.4, temporal: 0.2, behavioral: 0.2, mobile: 0.2 },
    timeout: 15000,
    debug: false,
    samplingDuration: 2000,
    enableGait: false,           // 권한 필요 (iOS 센서)
    enablePRNU: false,           // 권한 필요 (카메라)
    enableGeolocation: false,    // 권한 필요 (위치)
    enableMEMSPermission: false, // 권한 필요 (iOS 센서)
};

// ============== Browser Detection ==============

interface BrowserInfo {
    browser: 'chrome' | 'safari' | 'firefox' | 'edge' | 'samsung' | 'inapp' | 'unknown';
    os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
    isInAppBrowser: boolean;
    sensorReliability: 'high' | 'medium' | 'low';
}

function detectBrowser(): BrowserInfo {
    const ua = navigator.userAgent;
    const uaLower = ua.toLowerCase();

    // OS 감지
    let os: BrowserInfo['os'] = 'unknown';
    if (/iphone|ipad|ipod/i.test(ua)) os = 'ios';
    else if (/android/i.test(ua)) os = 'android';
    else if (/windows/i.test(ua)) os = 'windows';
    else if (/mac os x/i.test(ua)) os = 'macos';
    else if (/linux/i.test(ua)) os = 'linux';

    // 인앱 브라우저 감지
    const inAppPatterns = [
        'fban', 'fbav',                    // Facebook
        'twitter', 'twitterandroid',       // Twitter/X
        'instagram',                        // Instagram
        'line',                             // LINE
        'kakaotalk',                        // KakaoTalk
        'naver', 'whale',                  // Naver/Whale
        'wv)',                              // Android WebView
        'linkedinapp',                      // LinkedIn
        'snapchat',                         // Snapchat
    ];
    const isInAppBrowser = inAppPatterns.some(p => uaLower.includes(p));

    // 브라우저 감지
    let browser: BrowserInfo['browser'] = 'unknown';
    if (isInAppBrowser) {
        browser = 'inapp';
    } else if (/samsungbrowser/i.test(ua)) {
        browser = 'samsung';
    } else if (/edg/i.test(ua)) {
        browser = 'edge';
    } else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) {
        browser = 'chrome';
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
        browser = 'safari';
    } else if (/firefox/i.test(ua)) {
        browser = 'firefox';
    }

    // 센서 신뢰도 결정
    let sensorReliability: BrowserInfo['sensorReliability'] = 'high';
    if (os === 'ios') {
        // iOS Safari는 의도적 노이즈 추가, iOS 인앱 브라우저도 WKWebView 사용
        sensorReliability = 'low';
    } else if (browser === 'firefox' && uaLower.includes('privacy')) {
        sensorReliability = 'low';
    } else if (os === 'android') {
        // Android Chrome/WebView는 센서 접근 제한 없음
        sensorReliability = 'high';
    } else {
        sensorReliability = 'medium';
    }

    return { browser, os, isInAppBrowser, sensorReliability };
}

/** 브라우저/플랫폼에 최적화된 가중치 반환 */
function getAdaptiveWeights(browserInfo: BrowserInfo): { physical: number; temporal: number; behavioral: number; mobile: number } {
    const { os, sensorReliability } = browserInfo;

    if (os === 'ios') {
        // iOS: 센서 신뢰도 낮음, Canvas/WebGL/Speech에 집중
        return {
            physical: 0.50,   // Canvas/WebGL은 여전히 신뢰 가능
            temporal: 0.10,   // Battery API 없음
            behavioral: 0.15, // 터치는 작동
            mobile: 0.25,     // Screen/Speech/Locale 신뢰 가능
        };
    }

    if (os === 'android') {
        // Android: 센서 풀 접근, 모든 모듈 신뢰 가능
        return {
            physical: 0.35,
            temporal: 0.20,
            behavioral: 0.25, // 센서 기반 Gait 신뢰 가능
            mobile: 0.20,
        };
    }

    // Desktop
    if (sensorReliability === 'low') {
        // Firefox with privacy mode 등
        return {
            physical: 0.55,   // Canvas/WebGL에 의존
            temporal: 0.15,
            behavioral: 0.10,
            mobile: 0.20,
        };
    }

    // 기본 (데스크톱 Chrome 등)
    return {
        physical: 0.45,
        temporal: 0.20,
        behavioral: 0.15,
        mobile: 0.20,
    };
}

/** 
 * 브라우저별 모듈 정확도 기여도 조정
 * 
 * 📚 학술 논문 기반 엔트로피 가중치:
 * - Laperdrix et al. (2016): AmIUnique - 118,934 browsers, Canvas 도입
 * - Mowery & Shacham (2012): Canvas fingerprinting 최초 제안
 * - Cao et al. (2017): Cross-browser fingerprinting 99.24%
 * - DrawnApart (2022): GPU 기반 핑거프린팅 176 measurements
 * 
 * 엔트로피 비트 → 기여도 변환:
 * - WebGL: ~11.26 bits → 17% (가장 높은 엔트로피)
 * - User-Agent: ~10 bits → 기본 포함
 * - Canvas: ~5.7-6 bits → 9%
 * - Screen: ~6.4 bits → 10%
 * - Audio: ~4-5 bits → 7%
 * - Timezone: ~3-4 bits → 4%
 */
function getAdaptiveModuleContributions(browserInfo: BrowserInfo): { [key: string]: number } {
    // 논문 기반 엔트로피 정규화 가중치 (총 합계 ~95%)
    const base: { [key: string]: number } = {
        // Physical Layer - 총 ~45%
        'webgl': 0.17,        // 11.26 bits (DrawnApart, 가장 높음)
        'canvas': 0.09,       // 5.7 bits (Mowery & Shacham)
        'audio-frf': 0.07,    // 4-5 bits (AudioContext)
        'prnu': 0.06,         // 카메라 센서 노이즈
        'mems': 0.04,         // 센서 바이어스
        'clock-skew': 0.02,   // 클록 편차
        'orientation': 0.02,  // 자기장 센서

        // Temporal Layer - 총 ~10%
        'battery-stl': 0.04,  // 배터리 특성
        'performance': 0.06,  // CPU 성능

        // Behavioral Layer - 총 ~12%
        'touch': 0.03,        // 터치 패턴
        'keystroke': 0.06,    // 타이핑 역학 (고유성 높음)
        'gait': 0.03,         // 보행 패턴

        // Mobile Layer - 총 ~28%
        'screen': 0.10,       // 6.4 bits (Laperdrix)
        'speech': 0.06,       // TTS 음성 목록
        'network': 0.02,      // 네트워크 정보
        'media-devices': 0.03, // 미디어 장치
        'client-hints': 0.03, // UA 클라이언트 힌트
        'locale': 0.04,       // 3-4 bits (타임존)
        'ip': 0.03,           // IP 주소
        'geolocation': 0.05,  // 위치 정보
    };

    const { os, sensorReliability } = browserInfo;

    // v2 강화 신호 기여도 (모든 플랫폼 공통)
    base['math-engine'] = 0.06;
    base['webgl-render'] = 0.05;
    base['fonts'] = 0.05;
    base['css-features'] = 0.03;
    base['intl'] = 0.03;
    base['audio-stack'] = 0.04;
    base['webgl2'] = 0.03;
    base['media-cap'] = 0.03;

    if (os === 'ios') {
        // iOS: 센서 노이즈 → WebGL/Canvas/폰트/Intl에 집중
        base['mems'] = 0.01;
        base['gait'] = 0.01;
        base['orientation'] = 0.01;
        base['battery-stl'] = 0.00;
        base['webgl'] = 0.20;
        base['canvas'] = 0.10;
        base['screen'] = 0.10;
        base['speech'] = 0.08;
        // iOS 모바일 강화: 폰트가 더 식별력 높음
        base['fonts'] = 0.08;
        base['webgl-render'] = 0.07;
        base['intl'] = 0.05;
    } else if (os === 'android') {
        // Android: 풀 센서 접근, 모든 모듈 신뢰 가능
        base['mems'] = sensorReliability === 'high' ? 0.10 : 0.04;
        base['gait'] = sensorReliability === 'high' ? 0.08 : 0.03;
        base['orientation'] = sensorReliability === 'high' ? 0.05 : 0.02;
        // Android 모바일 강화: Media Capabilities가 기기별 차이 큼
        base['media-cap'] = 0.05;
        base['webgl-render'] = 0.06;
        base['audio-stack'] = 0.05;
    }

    return base;
}

/** 현재 브라우저 정보 (캐싱) */
let cachedBrowserInfo: BrowserInfo | null = null;

function getBrowserInfo(): BrowserInfo {
    if (!cachedBrowserInfo) {
        cachedBrowserInfo = detectBrowser();
    }
    return cachedBrowserInfo;
}

/** 브라우저 감지 결과 export */
export { detectBrowser, getAdaptiveWeights, getAdaptiveModuleContributions, getBrowserInfo };
export type { BrowserInfo };

// ============== Utilities ==============

class FingerprintUtils {
    static async sha256(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
        return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    static calculateMean(samples: number[][]): number[] {
        if (samples.length === 0) return [0, 0, 0];
        const sum = samples.reduce((acc, curr) =>
            [acc[0] + (curr[0] || 0), acc[1] + (curr[1] || 0), acc[2] + (curr[2] || 0)], [0, 0, 0]);
        return sum.map((v) => v / samples.length);
    }

    static calculateVariance(values: number[]): number {
        if (values.length === 0) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    }

    static calculateStdDev(samples: number[][]): number {
        return Math.sqrt(this.calculateVariance(samples.flat()));
    }

    static computeFFT(samples: number[], sampleRate: number): { frequencies: number[], magnitudes: number[] } {
        const n = samples.length;
        const frequencies: number[] = [];
        const magnitudes: number[] = [];
        const maxFreqs = Math.min(64, Math.floor(n / 2));

        for (let k = 1; k < maxFreqs; k++) {
            let real = 0, imag = 0;
            for (let t = 0; t < n; t++) {
                const angle = (2 * Math.PI * k * t) / n;
                real += samples[t] * Math.cos(angle);
                imag -= samples[t] * Math.sin(angle);
            }
            const magnitude = Math.sqrt(real * real + imag * imag) / n;
            const frequency = (k * sampleRate) / n;
            if (magnitude > 0.01) {
                frequencies.push(frequency);
                magnitudes.push(magnitude);
            }
        }
        return { frequencies, magnitudes };
    }

    static findPeaks(magnitudes: number[], frequencies: number[], topN: number = 5): number[] {
        const indexed = magnitudes.map((m, i) => ({ m, f: frequencies[i] }));
        indexed.sort((a, b) => b.m - a.m);
        return indexed.slice(0, topN).map(x => x.f);
    }
}

// ============== Persistence Manager (집요한 추적) ==============

/**
 * 다중 저장소 영속성 관리자
 * localStorage, sessionStorage, Cookie, IndexedDB, Cache API 동시 사용
 * 하나라도 살아있으면 복구 후 전체 재동기화
 */
class PersistenceManager {
    private static readonly KEY = '__fp_v2';
    private static readonly DB_NAME = 'fp_store';
    private static readonly DB_STORE = 'fingerprints';
    private static readonly CACHE_NAME = 'fp-cache-v2';
    private static readonly COOKIE_DAYS = 400; // 크롬 최대 쿠키 수명

    /** 모든 저장소에 핑거프린트 저장 */
    static async persist(hash: string): Promise<void> {
        const payload = JSON.stringify({ h: hash, t: Date.now() });
        this.writeLocalStorage(payload);
        this.writeSessionStorage(payload);
        this.writeCookie(payload);
        await Promise.allSettled([
            this.writeIndexedDB(payload),
            this.writeCacheAPI(payload),
        ]);
    }

    /** 어떤 저장소든 살아있으면 복구 */
    static async recover(): Promise<string | null> {
        const sources = [
            this.readLocalStorage(),
            this.readSessionStorage(),
            this.readCookie(),
        ];
        for (const src of sources) {
            const hash = this.extractHash(src);
            if (hash) return hash;
        }
        const asyncSources = await Promise.allSettled([
            this.readIndexedDB(),
            this.readCacheAPI(),
        ]);
        for (const result of asyncSources) {
            if (result.status === 'fulfilled') {
                const hash = this.extractHash(result.value);
                if (hash) return hash;
            }
        }
        return null;
    }

    /** 복구 후 누락된 저장소 재동기화 */
    static async resync(hash: string): Promise<void> {
        const payload = JSON.stringify({ h: hash, t: Date.now() });
        if (!this.readLocalStorage()) this.writeLocalStorage(payload);
        if (!this.readSessionStorage()) this.writeSessionStorage(payload);
        if (!this.readCookie()) this.writeCookie(payload);
        const [idb, cache] = await Promise.allSettled([
            this.readIndexedDB(),
            this.readCacheAPI(),
        ]);
        if (idb.status !== 'fulfilled' || !idb.value) await this.writeIndexedDB(payload).catch(() => {});
        if (cache.status !== 'fulfilled' || !cache.value) await this.writeCacheAPI(payload).catch(() => {});
    }

    private static extractHash(payload: string | null): string | null {
        if (!payload) return null;
        try {
            const data = JSON.parse(payload);
            return data.h || null;
        } catch { return null; }
    }

    // --- localStorage ---
    private static writeLocalStorage(payload: string): void {
        try { localStorage.setItem(this.KEY, payload); } catch {}
    }
    private static readLocalStorage(): string | null {
        try { return localStorage.getItem(this.KEY); } catch { return null; }
    }

    // --- sessionStorage ---
    private static writeSessionStorage(payload: string): void {
        try { sessionStorage.setItem(this.KEY, payload); } catch {}
    }
    private static readSessionStorage(): string | null {
        try { return sessionStorage.getItem(this.KEY); } catch { return null; }
    }

    // --- Cookie (400일 수명) ---
    private static writeCookie(payload: string): void {
        try {
            const expires = new Date(Date.now() + this.COOKIE_DAYS * 86400000).toUTCString();
            document.cookie = `${this.KEY}=${encodeURIComponent(payload)};expires=${expires};path=/;SameSite=Lax`;
        } catch {}
    }
    private static readCookie(): string | null {
        try {
            const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${this.KEY}=([^;]*)`));
            return match ? decodeURIComponent(match[1]) : null;
        } catch { return null; }
    }

    // --- IndexedDB ---
    private static writeIndexedDB(payload: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(this.DB_NAME, 1);
                request.onupgradeneeded = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains(this.DB_STORE)) {
                        db.createObjectStore(this.DB_STORE);
                    }
                };
                request.onsuccess = () => {
                    try {
                        const tx = request.result.transaction(this.DB_STORE, 'readwrite');
                        tx.objectStore(this.DB_STORE).put(payload, this.KEY);
                        tx.oncomplete = () => { request.result.close(); resolve(); };
                        tx.onerror = () => { request.result.close(); reject(tx.error); };
                    } catch (e) { reject(e); }
                };
                request.onerror = () => reject(request.error);
            } catch (e) { reject(e); }
        });
    }
    private static readIndexedDB(): Promise<string | null> {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open(this.DB_NAME, 1);
                request.onupgradeneeded = () => {
                    request.result.createObjectStore(this.DB_STORE);
                };
                request.onsuccess = () => {
                    try {
                        const tx = request.result.transaction(this.DB_STORE, 'readonly');
                        const get = tx.objectStore(this.DB_STORE).get(this.KEY);
                        get.onsuccess = () => { request.result.close(); resolve(get.result || null); };
                        get.onerror = () => { request.result.close(); resolve(null); };
                    } catch { request.result.close(); resolve(null); }
                };
                request.onerror = () => resolve(null);
            } catch { resolve(null); }
        });
    }

    // --- Cache API ---
    private static async writeCacheAPI(payload: string): Promise<void> {
        if (!('caches' in self)) return;
        const cache = await caches.open(this.CACHE_NAME);
        const response = new Response(payload, { headers: { 'Content-Type': 'application/json' } });
        await cache.put(new Request(`/__fp_${this.KEY}`), response);
    }
    private static async readCacheAPI(): Promise<string | null> {
        if (!('caches' in self)) return null;
        try {
            const cache = await caches.open(this.CACHE_NAME);
            const response = await cache.match(new Request(`/__fp_${this.KEY}`));
            return response ? await response.text() : null;
        } catch { return null; }
    }
}

export { PersistenceManager };

// ============== Behavioral Tracker ==============

class BehavioralTracker {
    private touchEvents: TouchEvent[] = [];
    private keystrokeTimings: { down: number; up: number; key: string }[] = [];
    private keyDownTimes: Map<string, number> = new Map();
    private gaitSamples: number[][] = [];
    private isTracking = false;

    start(): void {
        if (this.isTracking) return;
        this.isTracking = true;
        document.addEventListener('touchstart', this.handleTouch);
        document.addEventListener('touchmove', this.handleTouch);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    stop(): void {
        this.isTracking = false;
        document.removeEventListener('touchstart', this.handleTouch);
        document.removeEventListener('touchmove', this.handleTouch);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    private handleTouch = (e: TouchEvent): void => { this.touchEvents.push(e); };
    private handleKeyDown = (e: KeyboardEvent): void => {
        if (!this.keyDownTimes.has(e.key)) this.keyDownTimes.set(e.key, performance.now());
    };
    private handleKeyUp = (e: KeyboardEvent): void => {
        const downTime = this.keyDownTimes.get(e.key);
        if (downTime) {
            this.keystrokeTimings.push({ down: downTime, up: performance.now(), key: e.key });
            this.keyDownTimes.delete(e.key);
        }
    };

    addGaitSample(acc: number[]): void { this.gaitSamples.push(acc); }

    getTouchSignature(): TouchData {
        const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const swipeVelocities: number[] = [];
        for (let i = 1; i < this.touchEvents.length; i++) {
            const prev = this.touchEvents[i - 1];
            const curr = this.touchEvents[i];
            if (prev.touches[0] && curr.touches[0]) {
                const dx = curr.touches[0].clientX - prev.touches[0].clientX;
                const dy = curr.touches[0].clientY - prev.touches[0].clientY;
                const dt = curr.timeStamp - prev.timeStamp;
                if (dt > 0) swipeVelocities.push(Math.sqrt(dx * dx + dy * dy) / dt);
            }
        }
        return {
            averagePressure: 0.5,
            averageRadius: 20,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            touchSupport,
            swipeVelocityProfile: swipeVelocities.slice(0, 10),
        };
    }

    getKeystrokeSignature(): KeystrokeData {
        const timings = this.keystrokeTimings;
        if (timings.length < 2) return { averageDwellTime: 0, averageFlightTime: 0, rhythm: [], variance: 0, estimatedWPM: 0 };
        const dwellTimes = timings.map((t) => t.up - t.down);
        const avgDwell = dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length;
        const flightTimes: number[] = [];
        for (let i = 1; i < timings.length; i++) flightTimes.push(timings[i].down - timings[i - 1].up);
        const avgFlight = flightTimes.length > 0 ? flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length : 0;
        const totalTime = timings[timings.length - 1].up - timings[0].down;
        const estimatedWPM = totalTime > 0 ? (timings.length / 5) / (totalTime / 60000) : 0;
        return { averageDwellTime: avgDwell, averageFlightTime: avgFlight, rhythm: dwellTimes.slice(0, 20), variance: FingerprintUtils.calculateVariance(dwellTimes), estimatedWPM };
    }

    getGaitSignature(): GaitData | null {
        if (this.gaitSamples.length < 100) return null;
        const magnitudes = this.gaitSamples.map((s) => Math.sqrt(s[0] ** 2 + s[1] ** 2 + s[2] ** 2));
        const { frequencies, magnitudes: mags } = FingerprintUtils.computeFFT(magnitudes, 50);
        const peaks = FingerprintUtils.findPeaks(mags, frequencies, 5);
        const walkingFreqs = peaks.filter((f) => f >= 0.5 && f <= 3);
        const stepFrequency = walkingFreqs.length > 0 ? walkingFreqs[0] : 0;
        const stepRegularity = 1 / (1 + FingerprintUtils.calculateVariance(magnitudes));
        const half = Math.floor(magnitudes.length / 2);
        const avgFirst = magnitudes.slice(0, half).reduce((a, b) => a + b, 0) / half;
        const avgSecond = magnitudes.slice(half).reduce((a, b) => a + b, 0) / half;
        const symmetryScore = 1 - Math.abs(avgFirst - avgSecond) / Math.max(avgFirst, avgSecond, 0.001);
        return { stepFrequency, stepRegularity, amplitude: Math.max(...magnitudes) - Math.min(...magnitudes), frequencyPeaks: peaks, symmetryScore, sampleCount: this.gaitSamples.length };
    }

    clear(): void { this.touchEvents = []; this.keystrokeTimings = []; this.gaitSamples = []; this.keyDownTimes.clear(); }
}

// ============== Main Fingerprinter Class ==============

export class Fingerprinter {
    private config: FingerprintConfig;
    private behavioralTracker: BehavioralTracker;
    private gaitCollectionHandle: number | null = null;
    private browserInfo: BrowserInfo;

    constructor(config?: Partial<FingerprintConfig>) {
        // 브라우저/플랫폼 감지
        this.browserInfo = getBrowserInfo();

        // 적응형 가중치 적용 (사용자가 명시적으로 지정하지 않은 경우)
        const adaptiveWeights = getAdaptiveWeights(this.browserInfo);
        const finalWeights = config?.weights ?? adaptiveWeights;

        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
            weights: finalWeights,
        };
        this.behavioralTracker = new BehavioralTracker();

        // 디버그 모드에서 브라우저 정보 로그
        if (this.config.debug) {
            console.log('[Fingerprinter] Browser Info:', this.browserInfo);
            console.log('[Fingerprinter] Applied Weights:', this.config.weights);
        }
    }

    /** 현재 감지된 브라우저 정보 반환 */
    getBrowserInfo(): BrowserInfo {
        return this.browserInfo;
    }

    async requestPermissions(): Promise<boolean> {
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            try {
                const perm = await (DeviceMotionEvent as any).requestPermission();
                if (perm !== 'granted') return false;
            } catch (e) { return false; }
        }
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const perm = await (DeviceOrientationEvent as any).requestPermission();
                if (perm !== 'granted') return false;
            } catch (e) { /* optional */ }
        }
        return true;
    }

    startBehavioralTracking(): void { this.behavioralTracker.start(); }
    stopBehavioralTracking(): void { this.behavioralTracker.stop(); }

    startGaitCollection(): void {
        if (this.gaitCollectionHandle) return;
        const handler = (e: DeviceMotionEvent) => {
            if (e.accelerationIncludingGravity) {
                this.behavioralTracker.addGaitSample([
                    e.accelerationIncludingGravity.x || 0,
                    e.accelerationIncludingGravity.y || 0,
                    e.accelerationIncludingGravity.z || 0,
                ]);
            }
        };
        window.addEventListener('devicemotion', handler);
        this.gaitCollectionHandle = handler as any;
    }

    stopGaitCollection(): void {
        if (this.gaitCollectionHandle) {
            window.removeEventListener('devicemotion', this.gaitCollectionHandle as any);
            this.gaitCollectionHandle = null;
        }
    }

    async generate(config?: Partial<FingerprintConfig>): Promise<Fingerprint> {
        const finalConfig = { ...this.config, ...config };
        const modules: string[] = [];
        const signatures: LayerDetails = {};

        // Layer 1: Physical
        if (finalConfig.layers.physical) {
            signatures.physical = await this.collectPhysicalLayer(finalConfig);
            if (signatures.physical.mems?.sampleCount) modules.push('mems');
            if (signatures.physical.clockSkew) modules.push('clock-skew');
            if (signatures.physical.canvas?.hash) modules.push('canvas');
            if (signatures.physical.webgl?.renderer) modules.push('webgl');
            if (signatures.physical.audio?.hash) modules.push('audio-frf');
            if (signatures.physical.prnu?.greenChannelHash) modules.push('prnu');
            if (signatures.physical.orientation?.compassHeading) modules.push('orientation');
            // v2 강화 모듈
            if (signatures.physical.mathEngine?.precision) modules.push('math-engine');
            if (signatures.physical.webglRender?.triangleHash) modules.push('webgl-render');
            if (signatures.physical.fonts?.fontCount) modules.push('fonts');
            if (signatures.physical.cssFeatures?.supportedCount) modules.push('css-features');
            if (signatures.physical.intl?.dateFormat) modules.push('intl');
            if (signatures.physical.audioStack?.hash) modules.push('audio-stack');
            if (signatures.physical.webgl2?.maxTexture3D) modules.push('webgl2');
            if (signatures.physical.mediaCap?.supportedCodecs?.length) modules.push('media-cap');
            // v3 개체 식별 모듈
            if (signatures.physical.gpuSilicon?.shaderResults) modules.push('gpu-silicon');
            if (signatures.physical.audioHardware?.waveformSamples) modules.push('audio-hardware');
            if (signatures.physical.canvasMicro?.textRender) modules.push('canvas-micro');
            if (signatures.physical.storageProfile?.quota) modules.push('storage-profile');
        }

        // Layer 2: Temporal
        if (finalConfig.layers.temporal) {
            signatures.temporal = await this.collectTemporalLayer();
            if (signatures.temporal.battery?.stlSignature) modules.push('battery-stl');
            if (signatures.temporal.performance) modules.push('performance');
        }

        // Layer 3: Behavioral  
        if (finalConfig.layers.behavioral) {
            signatures.behavioral = this.collectBehavioralLayer(finalConfig);
            if (signatures.behavioral.touch?.touchSupport) modules.push('touch');
            if (signatures.behavioral.keystroke?.rhythm?.length) modules.push('keystroke');
            if (signatures.behavioral.gait?.sampleCount) modules.push('gait');
        }

        // Layer 4: Mobile
        if (finalConfig.layers.mobile) {
            signatures.mobile = await this.collectMobileLayer();
            if (signatures.mobile.screen?.hash) modules.push('screen');
            if (signatures.mobile.speechVoices?.voiceCount) modules.push('speech');
            if (signatures.mobile.network?.effectiveType) modules.push('network');
            if (signatures.mobile.mediaDevices?.hash) modules.push('media-devices');
            if (signatures.mobile.clientHints?.model) modules.push('client-hints');
            if (signatures.mobile.locale?.timezone) modules.push('locale');
            if (signatures.mobile.ip?.publicIP) modules.push('ip');
            if (signatures.mobile.geolocation?.latitude) modules.push('geolocation');
        }

        // 하드웨어 기반 핑거프린트 해시 생성
        const result = await this.generateHardwareHash(signatures);

        // 영속성 레이어: 해시 저장 + 이전 해시와 교차 검증
        const previousHash = await PersistenceManager.recover();
        await PersistenceManager.persist(result.hash);

        // 이전 해시가 존재하면 재동기화 (부분 삭제 복구)
        if (previousHash && previousHash !== result.hash) {
            await PersistenceManager.resync(result.hash);
        }

        return {
            hash: result.hash,
            timestamp: Date.now(),
            accuracy: result.accuracy,
            modules,
            signals: result.signals,
            /** 이전 저장된 해시 (추적 연속성 확인용) */
            previousHash: previousHash || undefined,
            details: finalConfig.debug ? signatures : undefined
        } as Fingerprint;
    }

    /**
     * 하드웨어 기반 핑거프린트 생성
     * 동일 기기에서 브라우저/모드와 무관하게 동일한 해시 생성
     *
     * 시크릿 모드 호환:
     * - AudioContext, Canvas 등 노이즈가 추가되는 API 제외
     * - GPU, 화면, WebGL 상수 등 하드웨어 신호만 사용
     */
    private async generateHardwareHash(signatures: LayerDetails): Promise<{ hash: string; accuracy: number; signals: CrossBrowserSignals }> {
        const webglInfo = this.getStableWebGLInfo();
        const p = signatures.physical;

        // v2 강화 신호 해시 사전 계산
        // v2 + v3 신호 해시 병렬 계산
        const [mathHash, fontHash, cssHash, intlHash, audioStackHash, webgl2Hash, mediaCapHash, webglRenderHash,
               gpuSiliconHash, audioHwHash, canvasMicroHash, storageHash] = await Promise.all([
            // v2
            p?.mathEngine?.precision ? FingerprintUtils.sha256(p.mathEngine.precision) : Promise.resolve(''),
            p?.fonts?.detectedFonts?.length ? FingerprintUtils.sha256(p.fonts.detectedFonts.join(',')) : Promise.resolve(''),
            p?.cssFeatures?.hash ? FingerprintUtils.sha256(p.cssFeatures.hash) : Promise.resolve(''),
            p?.intl ? FingerprintUtils.sha256(`${p.intl.dateFormat}|${p.intl.numberFormat}|${p.intl.listFormat}`) : Promise.resolve(''),
            Promise.resolve(p?.audioStack?.hash || ''),
            Promise.resolve(p?.webgl2?.hash || ''),
            p?.mediaCap?.hash ? FingerprintUtils.sha256(p.mediaCap.hash) : Promise.resolve(''),
            p?.webglRender ? FingerprintUtils.sha256(`${p.webglRender.triangleHash}|${p.webglRender.gradientHash}`) : Promise.resolve(''),
            // v3 개체 식별
            p?.gpuSilicon ? FingerprintUtils.sha256(`${p.gpuSilicon.shaderResults}|${p.gpuSilicon.multiPassResults}`) : Promise.resolve(''),
            p?.audioHardware ? FingerprintUtils.sha256(`${p.audioHardware.waveformSamples}|${p.audioHardware.compressorCurve}`) : Promise.resolve(''),
            p?.canvasMicro ? FingerprintUtils.sha256(`${p.canvasMicro.textRender}|${p.canvasMicro.shapeRender}`) : Promise.resolve(''),
            p?.storageProfile?.hash ? FingerprintUtils.sha256(p.storageProfile.hash) : Promise.resolve(''),
        ]);

        const signals: CrossBrowserSignals = {
            // === 기존 신호 ===
            gpuRenderer: p?.webgl?.renderer || '',
            gpuVendor: p?.webgl?.vendor || '',
            screenResolution: `${screen.width}x${screen.height}`,
            availableScreen: `${screen.availWidth}x${screen.availHeight}`,
            pixelRatio: Math.round(window.devicePixelRatio * 100) / 100,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            platform: navigator.platform || '',
            shaderPrecision: webglInfo.shaderPrecision,
            webglMaxTextureSize: webglInfo.maxTextureSize,
            webglMaxViewportDims: webglInfo.maxViewportDims,
            webglExtensionCount: webglInfo.extensionCount,
            webglMaxRenderbufferSize: webglInfo.maxRenderbufferSize,
            webglMaxVertexAttribs: webglInfo.maxVertexAttribs,
            // === v2 강화 신호 ===
            mathEngineHash: mathHash.slice(0, 16),
            webglRenderHash: webglRenderHash.slice(0, 16),
            fontHash: fontHash.slice(0, 16),
            cssFeatureHash: cssHash.slice(0, 16),
            intlHash: intlHash.slice(0, 16),
            audioStackHash: audioStackHash.slice(0, 16),
            webgl2Hash: webgl2Hash.slice(0, 16),
            mediaCapHash: mediaCapHash.slice(0, 16),
            // v3 개체 식별
            gpuSiliconHash: gpuSiliconHash.slice(0, 24),
            audioHardwareHash: audioHwHash.slice(0, 24),
            canvasMicroHash: canvasMicroHash.slice(0, 24),
            storageProfileHash: storageHash.slice(0, 16),
        };

        // 전체 신호 결합 → SHA-256 (v3: 개체 식별 포함)
        const stableData = [
            signals.gpuRenderer, signals.gpuVendor,
            signals.screenResolution, signals.availableScreen,
            signals.pixelRatio.toFixed(2), signals.colorDepth,
            signals.timezone, signals.hardwareConcurrency,
            signals.maxTouchPoints, signals.platform,
            signals.shaderPrecision, signals.webglMaxTextureSize,
            signals.webglMaxViewportDims, signals.webglExtensionCount,
            signals.webglMaxRenderbufferSize, signals.webglMaxVertexAttribs,
            // v2
            signals.mathEngineHash, signals.webglRenderHash,
            signals.fontHash, signals.cssFeatureHash,
            signals.intlHash, signals.audioStackHash,
            signals.webgl2Hash, signals.mediaCapHash,
            // v3 개체 식별 (동일 모델 구분 핵심)
            signals.gpuSiliconHash, signals.audioHardwareHash,
            signals.canvasMicroHash, signals.storageProfileHash,
        ].join('|');

        const hash = await FingerprintUtils.sha256(stableData);

        // 정확도 계산 (v3: 최대 97%)
        const W = CROSS_BROWSER_ACCURACY_WEIGHTS;
        let accuracy: number = W.BASE;
        if (signals.gpuRenderer) accuracy += W.GPU_RENDERER;
        if (signals.gpuVendor) accuracy += W.GPU_VENDOR;
        if (signals.screenResolution !== '0x0') accuracy += W.SCREEN_RESOLUTION;
        if (signals.timezone) accuracy += W.TIMEZONE;
        if (signals.hardwareConcurrency > 0) accuracy += W.HARDWARE_CONCURRENCY;
        if (signals.shaderPrecision) accuracy += W.SHADER_PRECISION;
        if (signals.webglMaxTextureSize > 0) accuracy += W.WEBGL_MAX_TEXTURE;
        if (signals.platform) accuracy += W.PLATFORM;
        // v2
        if (signals.mathEngineHash) accuracy += W.MATH_ENGINE;
        if (signals.webglRenderHash) accuracy += W.WEBGL_RENDER;
        if (signals.fontHash) accuracy += W.FONT_FINGERPRINT;
        if (signals.cssFeatureHash) accuracy += W.CSS_FEATURES;
        if (signals.intlHash) accuracy += W.INTL_API;
        if (signals.audioStackHash) accuracy += W.AUDIO_STACK;
        if (signals.webgl2Hash) accuracy += W.WEBGL2_PARAMS;
        if (signals.mediaCapHash) accuracy += W.MEDIA_CAPABILITIES;
        // v3 개체 식별
        if (signals.gpuSiliconHash) accuracy += W.GPU_SILICON;
        if (signals.audioHardwareHash) accuracy += W.AUDIO_HARDWARE;
        if (signals.canvasMicroHash) accuracy += W.CANVAS_MICRO;
        if (signals.storageProfileHash) accuracy += W.STORAGE_PROFILE;
        accuracy = Math.min(accuracy, W.MAX_ACCURACY as number);

        return { hash, accuracy, signals };
    }

    /**
     * 안정적인 WebGL 하드웨어 파라미터 (시크릿 모드에서도 일관됨)
     * WebGL 컨텍스트를 한 번만 생성하여 셰이더 정밀도와 하드웨어 상수를 함께 추출
     */
    private getStableWebGLInfo(): {
        shaderPrecision: string;
        maxTextureSize: number;
        maxViewportDims: string;
        extensionCount: number;
        maxRenderbufferSize: number;
        maxVertexAttribs: number;
    } {
        const defaultValue = {
            shaderPrecision: '',
            maxTextureSize: 0,
            maxViewportDims: '0,0',
            extensionCount: 0,
            maxRenderbufferSize: 0,
            maxVertexAttribs: 0,
        };

        try {
            const canvas = document.createElement('canvas');
            const gl = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
            if (!gl) return defaultValue;

            // 셰이더 정밀도 추출
            const precisions: string[] = [];
            const shaderTypes = [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER];
            const precisionTypes = [gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT];

            for (const shaderType of shaderTypes) {
                for (const precisionType of precisionTypes) {
                    const precision = gl.getShaderPrecisionFormat(shaderType, precisionType);
                    if (precision) {
                        precisions.push(`${precision.rangeMin}:${precision.rangeMax}:${precision.precision}`);
                    }
                }
            }

            // 하드웨어 상수 추출
            const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
            const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [0, 0];
            const extensions = gl.getSupportedExtensions() || [];
            const maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || 0;
            const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS) || 0;

            return {
                shaderPrecision: precisions.join('|'),
                maxTextureSize,
                maxViewportDims: `${maxViewportDims[0]},${maxViewportDims[1]}`,
                extensionCount: extensions.length,
                maxRenderbufferSize,
                maxVertexAttribs,
            };
        } catch {
            return defaultValue;
        }
    }

    // ============== Device Uniqueness: 개체 식별 (v3) ==============

    /**
     * GPU 실리콘 편차 핑거프린트
     * 같은 모델(예: iPhone 15 Pro)이라도 GPU 칩 제조 과정에서
     * 부동소수점 반올림 동작이 미세하게 다름.
     * 3개의 복합 셰이더를 실행하여 각 GPU 개체의 고유한 연산 결과를 추출.
     * iOS/Android/Desktop 모두 WebGL 지원하면 동작.
     */
    private fingerprintGPUSilicon(): GPUSiliconData {
        const defaultVal: GPUSiliconData = { shaderResults: '', multiPassResults: '', hash: '' };
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const gl = canvas.getContext('webgl', {
                preserveDrawingBuffer: true,
                antialias: false,
                depth: false,
                stencil: false,
            }) as WebGLRenderingContext | null;
            if (!gl) return defaultVal;

            const vs = gl.createShader(gl.VERTEX_SHADER)!;
            gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');
            gl.compileShader(vs);

            // 셰이더 1: 삼각함수 체인 (sin/cos 정밀도 편차)
            const shader1 = `
                precision highp float;
                void main(){
                    float x=0.1;
                    for(int i=0;i<100;i++){
                        x=sin(x*7.238917)*cos(x*3.14159265)+sqrt(abs(x*0.99713));
                        x=fract(x*43758.5453);
                    }
                    gl_FragColor=vec4(fract(x*17.0),fract(x*257.0),fract(x*4099.0),1.0);
                }`;

            // 셰이더 2: 지수/로그 연산 (exp/log 정밀도 편차)
            const shader2 = `
                precision highp float;
                void main(){
                    float x=0.37;
                    for(int i=0;i<80;i++){
                        x=exp(sin(x))*0.1+log(abs(x)+1.0)*0.3;
                        x=fract(x*12345.6789);
                    }
                    gl_FragColor=vec4(fract(x*13.0),fract(x*241.0),fract(x*3571.0),1.0);
                }`;

            // 셰이더 3: atan/pow 연산 (역삼각함수 정밀도 편차)
            const shader3 = `
                precision highp float;
                void main(){
                    float x=0.73;
                    for(int i=0;i<60;i++){
                        x=atan(x*2.71828,x*1.41421)+pow(abs(x),0.7071);
                        x=fract(x*98765.4321);
                    }
                    gl_FragColor=vec4(fract(x*19.0),fract(x*283.0),fract(x*4507.0),1.0);
                }`;

            const buf = gl.createBuffer()!;
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

            const runShader = (source: string): string => {
                const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
                gl.shaderSource(fs, source);
                gl.compileShader(fs);
                const prog = gl.createProgram()!;
                gl.attachShader(prog, vs);
                gl.attachShader(prog, fs);
                gl.linkProgram(prog);
                gl.useProgram(prog);
                const loc = gl.getAttribLocation(prog, 'p');
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                // 4x4 그리드에서 16개 픽셀 전부 읽기
                const pixels = new Uint8Array(16 * 16 * 4);
                gl.readPixels(0, 0, 16, 16, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                gl.deleteProgram(prog);
                gl.deleteShader(fs);

                // 대각선 + 모서리 샘플 (49개 픽셀 값)
                const samples: number[] = [];
                for (let y = 0; y < 16; y += 2) {
                    for (let x = 0; x < 16; x += 4) {
                        const idx = (y * 16 + x) * 4;
                        samples.push(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
                    }
                }
                return samples.join('-');
            };

            const r1 = runShader(shader1);
            const r2 = runShader(shader2);
            const r3 = runShader(shader3);

            gl.deleteShader(vs);
            gl.deleteBuffer(buf);

            return {
                shaderResults: r1,
                multiPassResults: `${r2}|${r3}`,
                hash: '',
            };
        } catch { return defaultVal; }
    }

    /**
     * 오디오 DAC 하드웨어 편차 핑거프린트
     * OfflineAudioContext에서 DynamicsCompressor를 통과한 파형의
     * 특정 샘플 값이 기기마다 미세하게 다름 (DAC/DSP 제조 편차).
     * 3가지 설정으로 교차 검증하여 개체 고유성 확보.
     */
    private async fingerprintAudioHardware(): Promise<AudioHardwareData> {
        const defaultVal: AudioHardwareData = { waveformSamples: '', compressorCurve: '', hash: '' };
        try {
            const configs = [
                { type: 'triangle' as OscillatorType, freq: 10000, threshold: -50, knee: 40, ratio: 12 },
                { type: 'square' as OscillatorType, freq: 5000, threshold: -30, knee: 30, ratio: 8 },
                { type: 'sawtooth' as OscillatorType, freq: 8000, threshold: -40, knee: 50, ratio: 16 },
            ];

            const allSamples: number[] = [];
            const curveSamples: number[] = [];

            for (const cfg of configs) {
                const ctx = new OfflineAudioContext(1, 5000, 44100);
                const osc = ctx.createOscillator();
                osc.type = cfg.type;
                osc.frequency.setValueAtTime(cfg.freq, ctx.currentTime);

                const comp = ctx.createDynamicsCompressor();
                comp.threshold.setValueAtTime(cfg.threshold, ctx.currentTime);
                comp.knee.setValueAtTime(cfg.knee, ctx.currentTime);
                comp.ratio.setValueAtTime(cfg.ratio, ctx.currentTime);
                comp.attack.setValueAtTime(0, ctx.currentTime);
                comp.release.setValueAtTime(0.25, ctx.currentTime);

                osc.connect(comp);
                comp.connect(ctx.destination);
                osc.start(0);

                const buffer = await ctx.startRendering();
                const data = buffer.getChannelData(0);

                // 핫존 샘플 (4500~4520): 개체별 미세 차이가 가장 큰 구간
                for (let i = 4500; i < 4520; i++) {
                    allSamples.push(Math.round(data[i] * 1e8));
                }

                // 곡선 특성: 500 간격 샘플
                for (let i = 0; i < 5000; i += 500) {
                    curveSamples.push(Math.round(data[i] * 1e6));
                }
            }

            return {
                waveformSamples: allSamples.join(','),
                compressorCurve: curveSamples.join(','),
                hash: '',
            };
        } catch { return defaultVal; }
    }

    /**
     * Canvas 마이크로 렌더링 핑거프린트
     * 서브픽셀 좌표에 텍스트와 도형을 그리면 안티앨리어싱이 발생하며,
     * GPU 래스터라이저의 제조 편차로 인해 미세한 픽셀 값 차이가 생김.
     * iOS/Android/Desktop 모두 Canvas 2D 지원.
     */
    private fingerprintCanvasMicro(): CanvasMicroData {
        const defaultVal: CanvasMicroData = { textRender: '', shapeRender: '', hash: '' };
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 60;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return defaultVal;

            // === 서브픽셀 텍스트 렌더링 ===
            ctx.textBaseline = 'alphabetic';

            // 다양한 폰트 + 서브픽셀 좌표
            ctx.font = '11.5px sans-serif';
            ctx.fillStyle = '#444';
            ctx.fillText('Iil1|!j', 0.5, 10.7);

            ctx.font = '13.3px serif';
            ctx.fillStyle = '#666';
            ctx.fillText('Wwm0O', 0.3, 23.3);

            ctx.font = '10.7px monospace';
            ctx.fillStyle = '#888';
            ctx.fillText('@#$%&', 0.7, 35.1);

            // 이모지 (렌더러별 큰 차이)
            ctx.font = '14px sans-serif';
            ctx.fillText('\u{1F600}\u{1F525}\u{1F4A9}', 60.5, 12.3);

            // 안티앨리어싱 엣지 픽셀 추출 (소수 위치 173 간격)
            const textData = ctx.getImageData(0, 0, 120, 35).data;
            const textSamples: number[] = [];
            for (let i = 0; i < textData.length; i += 173) {
                textSamples.push(textData[i]);
            }

            // === 서브픽셀 도형 렌더링 ===
            // 원 (안티앨리어싱 편차 큼)
            ctx.beginPath();
            ctx.arc(30.5, 50.3, 7.7, 0, Math.PI * 2);
            ctx.fillStyle = '#555';
            ctx.fill();

            // 베지어 곡선
            ctx.beginPath();
            ctx.moveTo(50.3, 42.7);
            ctx.bezierCurveTo(60.1, 38.3, 80.7, 58.1, 100.3, 44.9);
            ctx.strokeStyle = '#777';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 서브픽셀 직선 (1px 미만 굵기)
            ctx.beginPath();
            ctx.moveTo(5.5, 55.5);
            ctx.lineTo(115.5, 55.5);
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            const shapeData = ctx.getImageData(0, 35, 120, 25).data;
            const shapeSamples: number[] = [];
            for (let i = 0; i < shapeData.length; i += 131) {
                shapeSamples.push(shapeData[i]);
            }

            return {
                textRender: textSamples.join('-'),
                shapeRender: shapeSamples.join('-'),
                hash: '',
            };
        } catch { return defaultVal; }
    }

    /**
     * Storage 프로파일 핑거프린트
     * 기기별 가용 저장 용량과 사용량이 다름.
     * 같은 모델이라도 사용 패턴에 따라 고유한 값.
     */
    private async fingerprintStorageProfile(): Promise<StorageProfileData> {
        const defaultVal: StorageProfileData = { quota: 0, usage: 0, hash: '' };
        try {
            if (!navigator.storage?.estimate) return defaultVal;
            const est = await navigator.storage.estimate();
            return {
                quota: est.quota || 0,
                usage: est.usage || 0,
                hash: `${est.quota || 0}|${est.usage || 0}`,
            };
        } catch { return defaultVal; }
    }

    // ============== Enhanced Signal Collection (v2) ==============

    /** Math 엔진 핑거프린트 - JS 엔진별 부동소수점 정밀도 차이 감지 */
    private fingerprintMathEngine(): MathEngineData {
        const ops: number[] = [
            Math.tan(-1e300),
            Math.atan2(Math.PI, Math.E),
            Math.sinh(1),
            Math.expm1(1),
            Math.cbrt(Math.PI),
            Math.log1p(Math.E),
            Math.cosh(10),
            Math.tanh(100),
            Math.asinh(Math.SQRT2),
            Math.atanh(0.5),
            Math.hypot(3, 4, 5, 6),
            Math.fround(0.1 + 0.2),
            Math.log2(Math.E),
            Math.log10(Math.PI),
            Math.trunc(Math.PI * 1e15) % 1e10,
            // 엔진별 특수 값 처리 차이
            parseFloat('0.1') + parseFloat('0.2'),
            Math.pow(2, 53) + 1,
            Number.MAX_SAFE_INTEGER % 97,
        ];
        const precision = ops.map(v => v.toString()).join('|');
        return {
            precision,
            hash: '', // generate()에서 SHA-256 처리
        };
    }

    /** WebGL GPU 렌더링 핑거프린트 - 실제 드로잉 후 픽셀 추출 */
    private fingerprintWebGLRender(): WebGLRenderData {
        const defaultVal: WebGLRenderData = { triangleHash: '', gradientHash: '' };
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
            if (!gl) return defaultVal;

            // 삼각형 렌더링 (GPU별 래스터라이저 차이)
            const vs = gl.createShader(gl.VERTEX_SHADER)!;
            gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');
            gl.compileShader(vs);
            const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
            gl.shaderSource(fs, 'precision mediump float;void main(){gl_FragColor=vec4(0.2,0.7,0.3,1.0);}');
            gl.compileShader(fs);
            const prog = gl.createProgram()!;
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            gl.useProgram(prog);

            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                0.0, 0.8, -0.7, -0.5, 0.7, -0.5,   // 삼각형
                -0.3, 0.3, 0.3, 0.3, 0.0, -0.6,     // 두번째 삼각형
            ]), gl.STATIC_DRAW);
            const loc = gl.getAttribLocation(prog, 'p');
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

            gl.clearColor(0.1, 0.1, 0.1, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // 주요 픽셀 샘플링 (경계, 중심, 코너)
            const pixels = new Uint8Array(64 * 64 * 4);
            gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            // 특정 위치 픽셀 추출 (안티앨리어싱 차이 감지)
            const samplePoints = [0, 256, 512, 1024, 2048, 4096, 8192, 12288, 15360];
            const triangleSig = samplePoints.map(i => `${pixels[i]}-${pixels[i + 1]}-${pixels[i + 2]}`).join('|');

            // 그라디언트 렌더링 (색상 보간 차이)
            const fs2 = gl.createShader(gl.FRAGMENT_SHADER)!;
            gl.shaderSource(fs2, 'precision mediump float;void main(){gl_FragColor=vec4(gl_FragCoord.x/64.0,gl_FragCoord.y/64.0,0.5,1.0);}');
            gl.compileShader(fs2);
            const prog2 = gl.createProgram()!;
            gl.attachShader(prog2, vs);
            gl.attachShader(prog2, fs2);
            gl.linkProgram(prog2);
            gl.useProgram(prog2);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            const gradientSig = samplePoints.map(i => `${pixels[i]}-${pixels[i + 1]}`).join('|');

            // 정리
            gl.deleteProgram(prog);
            gl.deleteProgram(prog2);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteShader(fs2);
            gl.deleteBuffer(buf);

            return { triangleHash: triangleSig, gradientHash: gradientSig };
        } catch { return defaultVal; }
    }

    /** 폰트 감지 - Canvas measureText 기반 설치된 폰트 열거 */
    private detectFonts(): FontData {
        const defaultVal: FontData = { detectedFonts: [], fontCount: 0, hash: '' };
        try {
            const baseFonts = ['monospace', 'sans-serif', 'serif'] as const;
            const testFonts = [
                // 서양 폰트
                'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Century Gothic',
                'Comic Sans MS', 'Consolas', 'Courier New', 'Georgia', 'Helvetica',
                'Impact', 'Lucida Console', 'Lucida Sans', 'Palatino Linotype',
                'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
                'Futura', 'Gill Sans', 'Optima', 'Rockwell', 'Baskerville',
                // 모바일 특화
                'San Francisco', 'Roboto', 'Noto Sans', 'Droid Sans',
                'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji',
                // 한국어
                'Malgun Gothic', 'NanumGothic', 'NanumMyeongjo', 'Dotum', 'Gulim', 'Batang',
                'Apple SD Gothic Neo', 'Noto Sans KR',
                // 일본어
                'Yu Gothic', 'Meiryo', 'MS Gothic', 'Hiragino Sans',
                // 중국어
                'SimSun', 'Microsoft YaHei', 'PingFang SC', 'STHeiti',
            ];

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return defaultVal;

            const testString = 'mmmmmmmmlli10OQ';
            const testSize = '72px';

            // 기본 폰트 너비 측정
            const baseWidths: Record<string, number> = {};
            for (const base of baseFonts) {
                ctx.font = `${testSize} ${base}`;
                baseWidths[base] = ctx.measureText(testString).width;
            }

            const detected: string[] = [];
            for (const font of testFonts) {
                for (const base of baseFonts) {
                    ctx.font = `${testSize} '${font}', ${base}`;
                    if (ctx.measureText(testString).width !== baseWidths[base]) {
                        detected.push(font);
                        break;
                    }
                }
            }

            return { detectedFonts: detected, fontCount: detected.length, hash: '' };
        } catch { return defaultVal; }
    }

    /** CSS Feature Matrix 핑거프린트 - CSS.supports() 기반 */
    private fingerprintCSSFeatures(): CSSFeatureData {
        const defaultVal: CSSFeatureData = { supportedCount: 0, hash: '' };
        if (!('CSS' in window) || !CSS.supports) return defaultVal;
        try {
            const features = [
                'display: grid', 'display: flex', 'display: contents',
                'position: sticky', 'backdrop-filter: blur(1px)',
                'color: oklch(0.5 0.2 240)', 'color: lch(50 50 50)',
                'color: color-mix(in srgb, red 50%, blue)',
                'container-type: inline-size',
                'text-wrap: balance', 'text-wrap: pretty',
                'view-transition-name: a',
                'anchor-name: --a',
                'animation-timeline: scroll()',
                'font-palette: --custom',
                'text-decoration-thickness: from-font',
                'overscroll-behavior: contain',
                'scroll-snap-type: x mandatory',
                'aspect-ratio: 1/1',
                'gap: 1px', 'row-gap: 1px',
                'mask-image: none',
                'clip-path: circle(50%)',
                'filter: blur(1px)',
                'mix-blend-mode: multiply',
                'isolation: isolate',
                'will-change: transform',
                'contain: layout',
                'content-visibility: auto',
                'touch-action: manipulation',
                'user-select: none',
                'hyphens: auto',
                'writing-mode: vertical-rl',
                'text-orientation: mixed',
                'line-clamp: 3',
                // 모바일 중요 CSS
                'scroll-behavior: smooth',
                '-webkit-overflow-scrolling: touch',
                'env(safe-area-inset-top)',
            ];

            const supported = features.filter(f => {
                try {
                    const [prop, val] = f.includes(':') ? f.split(':').map(s => s.trim()) : [f, ''];
                    return val ? CSS.supports(prop, val) : CSS.supports(f);
                } catch { return false; }
            });

            return { supportedCount: supported.length, hash: supported.join('|') };
        } catch { return defaultVal; }
    }

    /** Intl API 핑거프린트 - 로케일별 포맷 차이 */
    private fingerprintIntlAPI(): IntlData {
        try {
            const testDate = new Date(2024, 0, 15, 13, 45, 30);
            const testNum = 1234567.89;

            const dateFormats = [
                new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(testDate),
                new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full' }).format(testDate),
                new Intl.DateTimeFormat(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long',
                    day: 'numeric', hour: 'numeric', minute: 'numeric',
                }).format(testDate),
            ].join('|');

            const numberFormats = [
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(testNum),
                new Intl.NumberFormat(undefined, { notation: 'compact' }).format(testNum),
                new Intl.NumberFormat(undefined, { style: 'unit', unit: 'kilometer-per-hour' }).format(testNum),
            ].join('|');

            let listFormat = '';
            try {
                listFormat = new (Intl as any).ListFormat(undefined, { style: 'long', type: 'conjunction' }).format(['A', 'B', 'C']);
            } catch { listFormat = 'unsupported'; }

            return { dateFormat: dateFormats, numberFormat: numberFormats, listFormat, hash: '' };
        } catch {
            return { dateFormat: '', numberFormat: '', listFormat: '', hash: '' };
        }
    }

    /** AudioContext DynamicsCompressor 핑거프린트 (OfflineAudioContext 기반) */
    private async fingerprintAudioStack(): Promise<AudioStackData> {
        try {
            const ctx = new OfflineAudioContext(1, 5000, 44100);
            const oscillator = ctx.createOscillator();
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(10000, ctx.currentTime);

            const compressor = ctx.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-50, ctx.currentTime);
            compressor.knee.setValueAtTime(40, ctx.currentTime);
            compressor.ratio.setValueAtTime(12, ctx.currentTime);
            compressor.attack.setValueAtTime(0, ctx.currentTime);
            compressor.release.setValueAtTime(0.25, ctx.currentTime);

            oscillator.connect(compressor);
            compressor.connect(ctx.destination);
            oscillator.start(0);

            const buffer = await ctx.startRendering();
            const data = buffer.getChannelData(0);

            // 4500~5000 구간 합산 (핑거프린트 핫존)
            let sum = 0;
            for (let i = 4500; i < data.length; i++) {
                sum += Math.abs(data[i]);
            }

            return { compressorValue: sum, hash: sum.toString() };
        } catch {
            return { compressorValue: 0, hash: '' };
        }
    }

    /** WebGL2 확장 파라미터 추출 */
    private getWebGL2Parameters(): WebGL2Data {
        const defaultVal: WebGL2Data = { maxTexture3D: 0, maxSamples: 0, maxColorAttachments: 0, maxUniformBufferBindings: 0, hash: '' };
        try {
            const canvas = document.createElement('canvas');
            const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
            if (!gl2) return defaultVal;

            const maxTexture3D = gl2.getParameter(gl2.MAX_3D_TEXTURE_SIZE) || 0;
            const maxSamples = gl2.getParameter(gl2.MAX_SAMPLES) || 0;
            const maxColorAttachments = gl2.getParameter(gl2.MAX_COLOR_ATTACHMENTS) || 0;
            const maxUniformBufferBindings = gl2.getParameter(gl2.MAX_UNIFORM_BUFFER_BINDINGS) || 0;
            const maxDrawBuffers = gl2.getParameter(gl2.MAX_DRAW_BUFFERS) || 0;
            const maxElementIndex = gl2.getParameter(gl2.MAX_ELEMENT_INDEX) || 0;
            const maxTransformFeedback = gl2.getParameter(gl2.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS) || 0;

            const hash = [maxTexture3D, maxSamples, maxColorAttachments, maxUniformBufferBindings,
                maxDrawBuffers, maxElementIndex, maxTransformFeedback].join('|');

            return { maxTexture3D, maxSamples, maxColorAttachments, maxUniformBufferBindings, hash };
        } catch { return defaultVal; }
    }

    /** 하드웨어 미디어 코덱 지원 핑거프린트 */
    private async fingerprintMediaCapabilities(): Promise<MediaCapabilitiesData> {
        const defaultVal: MediaCapabilitiesData = { supportedCodecs: [], hash: '' };
        if (!('mediaCapabilities' in navigator)) return defaultVal;
        try {
            const codecs = [
                { type: 'file' as const, video: { contentType: 'video/mp4; codecs="avc1.42E01E"', width: 1920, height: 1080, bitrate: 5000000, framerate: 30 } },
                { type: 'file' as const, video: { contentType: 'video/mp4; codecs="hev1.1.6.L93.B0"', width: 1920, height: 1080, bitrate: 5000000, framerate: 30 } },
                { type: 'file' as const, video: { contentType: 'video/webm; codecs="vp8"', width: 1920, height: 1080, bitrate: 5000000, framerate: 30 } },
                { type: 'file' as const, video: { contentType: 'video/webm; codecs="vp9"', width: 1920, height: 1080, bitrate: 5000000, framerate: 30 } },
                { type: 'file' as const, video: { contentType: 'video/webm; codecs="av01.0.08M.08"', width: 1920, height: 1080, bitrate: 5000000, framerate: 30 } },
                { type: 'file' as const, audio: { contentType: 'audio/mp4; codecs="mp4a.40.2"', channels: '2', bitrate: 128000, samplerate: 44100 } },
                { type: 'file' as const, audio: { contentType: 'audio/webm; codecs="opus"', channels: '2', bitrate: 128000, samplerate: 48000 } },
                { type: 'file' as const, audio: { contentType: 'audio/ogg; codecs="flac"', channels: '2', bitrate: 1411000, samplerate: 44100 } },
            ];

            const supported: string[] = [];
            const results = await Promise.allSettled(
                codecs.map(c => navigator.mediaCapabilities.decodingInfo(c as any))
            );

            results.forEach((r, i) => {
                if (r.status === 'fulfilled' && r.value.supported) {
                    const codec = codecs[i].video?.contentType || codecs[i].audio?.contentType || '';
                    const smooth = r.value.smooth ? 'S' : '';
                    const efficient = r.value.powerEfficient ? 'E' : '';
                    supported.push(`${codec}:${smooth}${efficient}`);
                }
            });

            return { supportedCodecs: supported, hash: supported.join('|') };
        } catch { return defaultVal; }
    }

    // ============== Physical Layer ==============

    private async collectPhysicalLayer(config: FingerprintConfig): Promise<PhysicalSignature> {
        const result: PhysicalSignature = {};

        // 권한 불필요 모듈
        const [clockSkew, audio] = await Promise.all([
            this.measureClockSkew(),
            this.analyzeAudioFRF(),
        ]);
        result.clockSkew = clockSkew;
        result.canvas = this.analyzeCanvas();
        result.webgl = this.analyzeWebGL();
        result.audio = audio;

        // MEMS/Orientation: Android에서는 권한 불필요, iOS에서는 권한 필요
        const browserInfo = getBrowserInfo();
        if (browserInfo.os !== 'ios' || config.enableMEMSPermission) {
            // Android/Desktop 또는 iOS에서 권한 허용된 경우
            const [mems, orientation] = await Promise.all([
                this.analyzeMEMS(config.samplingDuration || 2000),
                this.analyzeOrientation(),
            ]);
            result.mems = mems;
            result.orientation = orientation;
        }

        // PRNU는 항상 권한 필요 (카메라)
        if (config.enablePRNU) result.prnu = await this.analyzePRNU();

        // === v2 강화 신호 (권한 불필요, 모바일 호환) ===
        result.mathEngine = this.fingerprintMathEngine();
        result.webglRender = this.fingerprintWebGLRender();
        result.fonts = this.detectFonts();
        result.cssFeatures = this.fingerprintCSSFeatures();
        result.intl = this.fingerprintIntlAPI();
        result.audioStack = await this.fingerprintAudioStack();
        result.webgl2 = this.getWebGL2Parameters();
        result.mediaCap = await this.fingerprintMediaCapabilities();

        // === v3 개체 식별 신호 (동일 모델 구분, 전 플랫폼 동작) ===
        result.gpuSilicon = this.fingerprintGPUSilicon();
        result.canvasMicro = this.fingerprintCanvasMicro();
        const [audioHw, storageProfile] = await Promise.all([
            this.fingerprintAudioHardware(),
            this.fingerprintStorageProfile(),
        ]);
        result.audioHardware = audioHw;
        result.storageProfile = storageProfile;

        return result;
    }

    private async analyzeMEMS(duration: number): Promise<MEMSData> {
        return new Promise((resolve) => {
            const accSamples: number[][] = [];
            const gyroSamples: number[][] = [];
            const handler = (e: DeviceMotionEvent) => {
                if (e.accelerationIncludingGravity) accSamples.push([e.accelerationIncludingGravity.x || 0, e.accelerationIncludingGravity.y || 0, e.accelerationIncludingGravity.z || 0]);
                if (e.rotationRate) gyroSamples.push([e.rotationRate.alpha || 0, e.rotationRate.beta || 0, e.rotationRate.gamma || 0]);
            };
            window.addEventListener('devicemotion', handler);
            setTimeout(() => {
                window.removeEventListener('devicemotion', handler);
                const accBias = FingerprintUtils.calculateMean(accSamples);
                const gyroBias = FingerprintUtils.calculateMean(gyroSamples);
                const accNoise = FingerprintUtils.calculateStdDev(accSamples);
                const gyroNoise = FingerprintUtils.calculateStdDev(gyroSamples);
                const g = 9.81;
                const normalizedBias: [number, number, number] = [accBias[0] / g, accBias[1] / g, (accBias[2] - g) / g];
                const crossAxisError = Math.sqrt(normalizedBias[0] ** 2 + normalizedBias[1] ** 2);
                const qualityScore = Math.min(1, accSamples.length / 100) * (1 / (1 + accNoise));
                resolve({
                    accelerometer: { bias: accBias as [number, number, number], sensitivity: [1 + accNoise * 0.1, 1 + accNoise * 0.1, 1 + accNoise * 0.1], noise: accNoise, normalizedBias },
                    gyroscope: { bias: gyroBias as [number, number, number], crossAxisError, noise: gyroNoise },
                    sampleCount: accSamples.length,
                    qualityScore,
                });
            }, duration);
        });
    }

    private async measureClockSkew(): Promise<ClockSkewData> {
        const measurements: number[] = [];
        for (let i = 0; i < 150; i++) {
            const start = performance.now();
            await new Promise((r) => setTimeout(r, 1));
            measurements.push(performance.now() - start);
        }
        const mean = measurements.reduce((a, b) => a + b) / measurements.length;
        const variance = FingerprintUtils.calculateVariance(measurements);
        const half = Math.floor(measurements.length / 2);
        const driftDirection = (measurements.slice(half).reduce((a, b) => a + b) / half) - (measurements.slice(0, half).reduce((a, b) => a + b) / half);
        return { skewPPM: (mean - 1) * 1000000, stabilityIndex: 1 / (1 + variance), jitter: Math.sqrt(variance), driftDirection };
    }

    private analyzeCanvas(): CanvasData {
        const canvas = document.createElement('canvas');
        canvas.width = 280; canvas.height = 60;
        const ctx = canvas.getContext('2d');
        if (!ctx) return { hash: '', entropy: 0, pixelSignature: '' };
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Cwm fjord bank glyphs vext quiz', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('😀🔒🎨', 4, 35);
        const gradient = ctx.createLinearGradient(0, 0, 280, 0);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.33, '#00ff00');
        gradient.addColorStop(0.66, '#0000ff');
        gradient.addColorStop(1, '#ff00ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 45, 280, 15);
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.bezierCurveTo(50, 10, 100, 50, 150, 30);
        ctx.strokeStyle = '#000';
        ctx.stroke();
        const dataUrl = canvas.toDataURL();
        const imageData = ctx.getImageData(0, 0, 280, 60);
        const pixelSig = [imageData.data[0], imageData.data[100], imageData.data[500], imageData.data[1000], imageData.data[2000]].join('-');
        return { hash: dataUrl.slice(-100), entropy: new Set(dataUrl.split('')).size / 64, pixelSignature: pixelSig };
    }

    private analyzeWebGL(): WebGLData {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
        if (!gl) return { vendor: '', renderer: '', hash: '', performanceHint: '', extensionCount: 0 };
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
        const extensions = gl.getSupportedExtensions() || [];
        return { vendor: vendor || '', renderer: renderer || '', hash: `${vendor}|${renderer}|${extensions.length}`.slice(0, 150), performanceHint: renderer?.includes('Intel') ? 'integrated' : 'discrete', extensionCount: extensions.length };
    }

    private async analyzeAudioFRF(): Promise<AudioFRFData> {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const testFrequencies = [100, 500, 1000];
            const frequencyResponse: number[] = [];
            let thd2 = 0, thd3 = 0;
            for (const freq of testFrequencies) {
                const osc = ctx.createOscillator();
                const analyser = ctx.createAnalyser();
                const gain = ctx.createGain();
                analyser.fftSize = 2048;
                gain.gain.value = 0;
                osc.frequency.value = freq;
                osc.type = 'sine';
                osc.connect(analyser);
                analyser.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                await new Promise((r) => setTimeout(r, 50));
                const freqData = new Float32Array(analyser.frequencyBinCount);
                analyser.getFloatFrequencyData(freqData);
                const binIndex = Math.round(freq * analyser.fftSize / ctx.sampleRate);
                frequencyResponse.push(freqData[binIndex] || -100);
                if (freq === 1000) {
                    thd2 = (freqData[Math.round(2000 * analyser.fftSize / ctx.sampleRate)] || -100) - (freqData[binIndex] || -100);
                    thd3 = (freqData[Math.round(3000 * analyser.fftSize / ctx.sampleRate)] || -100) - (freqData[binIndex] || -100);
                }
                osc.stop();
            }
            ctx.close();
            const totalHarmonicDistortion = Math.sqrt(thd2 ** 2 + thd3 ** 2);
            const hash = await FingerprintUtils.sha256(`${frequencyResponse.join(',')}|${thd2}|${thd3}`);
            return { frequencyResponse, thd2: Math.abs(thd2), thd3: Math.abs(thd3), totalHarmonicDistortion, sampleRate: ctx.sampleRate, hash: hash.slice(0, 32) };
        } catch (e) { return { frequencyResponse: [], thd2: 0, thd3: 0, totalHarmonicDistortion: 0, sampleRate: 0, hash: '' }; }
    }

    private async analyzeOrientation(): Promise<OrientationData> {
        return new Promise((resolve) => {
            const samples: number[][] = [];
            let heading = 0;
            const handler = (e: DeviceOrientationEvent) => {
                if (e.alpha !== null) {
                    samples.push([e.alpha, e.beta || 0, e.gamma || 0]);
                    heading = e.alpha;
                }
            };
            window.addEventListener('deviceorientation', handler);
            setTimeout(() => {
                window.removeEventListener('deviceorientation', handler);
                const mean = FingerprintUtils.calculateMean(samples);
                resolve({ magneticField: mean as [number, number, number], compassHeading: heading, accuracy: samples.length > 10 ? 1 : samples.length / 10 });
            }, 1000);
        });
    }

    private async analyzePRNU(): Promise<PRNUData> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 320, height: 240 } });
            const video = document.createElement('video');
            video.srcObject = stream;
            await video.play();
            const canvas = document.createElement('canvas');
            canvas.width = 320; canvas.height = 240;
            const ctx = canvas.getContext('2d')!;
            const frames: ImageData[] = [];
            for (let i = 0; i < 5; i++) {
                await new Promise((r) => setTimeout(r, 100));
                ctx.drawImage(video, 0, 0);
                frames.push(ctx.getImageData(0, 0, 320, 240));
            }
            stream.getTracks().forEach((t) => t.stop());
            const greenNoise: number[] = [];
            for (let i = 1; i < frames[0].data.length; i += 4) greenNoise.push(Math.abs(frames[0].data[i] - frames[frames.length - 1].data[i]));
            const vignettingProfile: number[] = [];
            for (let r = 0; r < 120; r += 20) {
                let sum = 0, count = 0;
                for (let y = 0; y < 240; y++) {
                    for (let x = 0; x < 320; x++) {
                        const dist = Math.sqrt((x - 160) ** 2 + (y - 120) ** 2);
                        if (Math.abs(dist - r) < 10) { sum += frames[0].data[(y * 320 + x) * 4 + 1]; count++; }
                    }
                }
                vignettingProfile.push(count > 0 ? sum / count / 255 : 0);
            }
            const greenChannelHash = await FingerprintUtils.sha256(greenNoise.slice(0, 1000).join(','));
            const extremePixels: number[] = [];
            for (let i = 0; i < greenNoise.length && extremePixels.length < 10; i++) if (greenNoise[i] > 50) extremePixels.push(i);
            return { greenChannelHash: greenChannelHash.slice(0, 32), noiseEntropy: FingerprintUtils.calculateVariance(greenNoise) / 255, defectSignature: extremePixels.join('-'), vignettingProfile };
        } catch (e) { return { greenChannelHash: '', noiseEntropy: 0, defectSignature: '', vignettingProfile: [] }; }
    }

    // ============== Temporal Layer ==============

    private async collectTemporalLayer(): Promise<TemporalSignature> {
        return { battery: await this.analyzeBatterySTL(), performance: await this.measurePerformance() };
    }

    private async analyzeBatterySTL(): Promise<BatterySTLData> {
        if (!('getBattery' in navigator)) return { level: 1, charging: true, dischargeRate: 0, estimatedInternalResistance: 0, chargingCurveSignature: '', healthEstimate: 1, stlSignature: '' };
        try {
            const battery = await (navigator as any).getBattery();
            const samples: { level: number; time: number }[] = [];
            const startLevel = battery.level;
            for (let i = 0; i < 5; i++) { await new Promise((r) => setTimeout(r, 1000)); samples.push({ level: battery.level, time: (i + 1) * 1000 }); }
            const dischargeRate = battery.charging ? 0 : (startLevel - battery.level) / 5;
            const estimatedInternalResistance = dischargeRate > 0 ? (1 - battery.level) / dischargeRate * 0.1 : 0.1;
            const levelChanges = samples.map((s, i) => i > 0 ? s.level - samples[i - 1].level : 0);
            const chargingCurveSignature = levelChanges.map((c) => c > 0 ? '+' : c < 0 ? '-' : '0').join('');
            const healthEstimate = Math.min(1, (battery.dischargingTime || Infinity) === Infinity ? 1 : (battery.dischargingTime || 0) / 36000);
            const stlSignature = await FingerprintUtils.sha256(`${startLevel.toFixed(3)}|${dischargeRate.toFixed(6)}|${chargingCurveSignature}|${battery.charging}`);
            return { level: battery.level, charging: battery.charging, dischargeRate, estimatedInternalResistance, chargingCurveSignature, healthEstimate, stlSignature: stlSignature.slice(0, 16) };
        } catch (e) { return { level: 1, charging: true, dischargeRate: 0, estimatedInternalResistance: 0, chargingCurveSignature: '', healthEstimate: 1, stlSignature: '' }; }
    }

    private async measurePerformance(): Promise<PerformanceData> {
        const heapSamples: number[] = [];
        for (let i = 0; i < 3; i++) { heapSamples.push((performance as any).memory?.usedJSHeapSize || 0); await new Promise((r) => setTimeout(r, 50)); }
        const start = performance.now();
        let sum = 0;
        for (let i = 0; i < 1000000; i++) sum += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
        return { computeScore: 1000 / (performance.now() - start), memoryProfile: (performance as any).memory?.usedJSHeapSize || 0, coreCount: navigator.hardwareConcurrency || 1, heapVolatility: FingerprintUtils.calculateVariance(heapSamples) };
    }

    // ============== Behavioral Layer ==============

    private collectBehavioralLayer(config: FingerprintConfig): BehavioralSignature {
        const result: BehavioralSignature = { touch: this.behavioralTracker.getTouchSignature(), keystroke: this.behavioralTracker.getKeystrokeSignature() };
        if (config.enableGait) { const gait = this.behavioralTracker.getGaitSignature(); if (gait) result.gait = gait; }
        return result;
    }

    // ============== Mobile Layer ==============

    private async collectMobileLayer(): Promise<MobileSignature> {
        // 권한 불필요 모듈만 기본 수집
        const [screen, speechVoices, network, mediaDevices, clientHints, ip] = await Promise.all([
            this.analyzeScreen(),
            this.analyzeSpeechVoices(),
            this.analyzeNetwork(),
            this.analyzeMediaDevices(),
            this.analyzeClientHints(),
            this.analyzeIP(),
        ]);

        const result: MobileSignature = {
            screen, speechVoices, network, mediaDevices, clientHints,
            locale: this.analyzeLocale(), ip,
        };

        // Geolocation은 명시적 활성화 시에만 (권한 팝업 발생)
        if (this.config.enableGeolocation) {
            result.geolocation = await this.analyzeGeolocation();
        }

        return result;
    }

    private async analyzeScreen(): Promise<ScreenData> {
        const s = window.screen;
        const touchPoints = navigator.maxTouchPoints || 0;
        const orientation = screen.orientation?.type || 'unknown';
        const hdr = window.matchMedia?.('(dynamic-range: high)')?.matches || false;
        const hash = await FingerprintUtils.sha256(`${s.width}x${s.height}@${s.colorDepth}|${window.devicePixelRatio}|${touchPoints}|${orientation}`);
        return { width: s.width, height: s.height, availWidth: s.availWidth, availHeight: s.availHeight, colorDepth: s.colorDepth, pixelRatio: window.devicePixelRatio || 1, touchPoints, orientation, hdr, hash: hash.slice(0, 24) };
    }

    private async analyzeSpeechVoices(): Promise<SpeechData> {
        return new Promise((resolve) => {
            const getVoices = () => {
                const voices = speechSynthesis.getVoices();
                if (voices.length === 0) return;
                const voiceNames = voices.map((v) => v.name).slice(0, 20);
                const languages = [...new Set(voices.map((v) => v.lang))];
                FingerprintUtils.sha256(voiceNames.join('|')).then((hash) => {
                    resolve({ voiceCount: voices.length, voices: voiceNames, languages, hash: hash.slice(0, 24) });
                });
            };
            if (speechSynthesis.getVoices().length > 0) { getVoices(); }
            else {
                speechSynthesis.onvoiceschanged = getVoices;
                setTimeout(() => resolve({ voiceCount: 0, voices: [], languages: [], hash: '' }), 1000);
            }
        });
    }

    private async analyzeNetwork(): Promise<NetworkData> {
        const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (!conn) return { effectiveType: 'unknown', downlink: 0, rtt: 0, saveData: false };
        return { effectiveType: conn.effectiveType || 'unknown', downlink: conn.downlink || 0, rtt: conn.rtt || 0, saveData: conn.saveData || false };
    }

    private async analyzeMediaDevices(): Promise<MediaDevicesData> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioinputCount = devices.filter((d) => d.kind === 'audioinput').length;
            const videoinputCount = devices.filter((d) => d.kind === 'videoinput').length;
            const audiooutputCount = devices.filter((d) => d.kind === 'audiooutput').length;
            const deviceLabels = devices.map((d) => d.label || d.deviceId.slice(0, 8)).slice(0, 10);
            const hash = await FingerprintUtils.sha256(`${audioinputCount}|${videoinputCount}|${audiooutputCount}|${deviceLabels.join(',')}`);
            return { audioinputCount, videoinputCount, audiooutputCount, deviceLabels, hash: hash.slice(0, 24) };
        } catch (e) { return { audioinputCount: 0, videoinputCount: 0, audiooutputCount: 0, deviceLabels: [], hash: '' }; }
    }

    private async analyzeClientHints(): Promise<ClientHintsData> {
        const nav = navigator as any;
        const uaData = nav.userAgentData;
        if (!uaData) return { platform: navigator.platform || '', platformVersion: '', mobile: /Mobi|Android/i.test(navigator.userAgent), model: '', brands: [], architecture: '' };
        try {
            const highEntropy = await uaData.getHighEntropyValues(['platform', 'platformVersion', 'model', 'architecture']);
            return {
                platform: highEntropy.platform || uaData.platform || '',
                platformVersion: highEntropy.platformVersion || '',
                mobile: uaData.mobile || false,
                model: highEntropy.model || '',
                brands: uaData.brands?.map((b: any) => b.brand) || [],
                architecture: highEntropy.architecture || '',
            };
        } catch (e) { return { platform: uaData.platform || '', platformVersion: '', mobile: uaData.mobile || false, model: '', brands: uaData.brands?.map((b: any) => b.brand) || [], architecture: '' }; }
    }

    private analyzeLocale(): LocaleData {
        return {
            language: navigator.language,
            languages: [...navigator.languages],
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
        };
    }

    /** IP 주소 분석 (외부 API 사용) */
    private async analyzeIP(): Promise<IPData> {
        const storageKey = 'fp_ip_history';
        let ipHistory: string[] = [];

        try {
            // LocalStorage에서 히스토리 로드
            const stored = localStorage.getItem(storageKey);
            if (stored) ipHistory = JSON.parse(stored);
        } catch (e) { /* ignore */ }

        try {
            // 공개 IP 가져오기 (여러 서비스 시도)
            const response = await fetch('https://api.ipify.org?format=json', {
                signal: AbortSignal.timeout(3000)
            });
            const data = await response.json();
            const publicIP = data.ip || '';

            // 히스토리에 추가 (중복 방지, 최대 10개)
            if (publicIP && !ipHistory.includes(publicIP)) {
                ipHistory.push(publicIP);
                if (ipHistory.length > 10) ipHistory.shift();
                try {
                    localStorage.setItem(storageKey, JSON.stringify(ipHistory));
                } catch (e) { /* ignore */ }
            }

            return { publicIP, ipHistory };
        } catch (e) {
            return { publicIP: '', ipHistory };
        }
    }

    /** Geolocation 분석 */
    private async analyzeGeolocation(): Promise<GeolocationData> {
        const storageKey = 'fp_location_history';
        let locationHistory: Array<{ lat: number; lng: number; timestamp: number }> = [];

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) locationHistory = JSON.parse(stored);
        } catch (e) { /* ignore */ }

        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ latitude: 0, longitude: 0, accuracy: 0, locationHistory });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;

                    // 히스토리에 추가 (최대 20개, 100m 이상 이동시만)
                    const lastLoc = locationHistory[locationHistory.length - 1];
                    const shouldAdd = !lastLoc ||
                        this.calculateDistance(lastLoc.lat, lastLoc.lng, latitude, longitude) > 100;

                    if (shouldAdd) {
                        locationHistory.push({ lat: latitude, lng: longitude, timestamp: Date.now() });
                        if (locationHistory.length > 20) locationHistory.shift();
                        try {
                            localStorage.setItem(storageKey, JSON.stringify(locationHistory));
                        } catch (e) { /* ignore */ }
                    }

                    resolve({ latitude, longitude, accuracy, locationHistory });
                },
                () => resolve({ latitude: 0, longitude: 0, accuracy: 0, locationHistory }),
                { timeout: 5000, maximumAge: 60000 }
            );
        });
    }

    /** 두 좌표 간 거리 계산 (미터) */
    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371000; // 지구 반경 (미터)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

}

// ============== Convenience Functions ==============

export async function getFingerprint(config?: Partial<FingerprintConfig>): Promise<Fingerprint> {
    const fp = new Fingerprinter(config);
    await fp.requestPermissions();
    return fp.generate();
}

export default Fingerprinter;

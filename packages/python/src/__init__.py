"""
Advanced Fingerprinting - Python SDK
다중 계층 엔트로피 융합 기반 고정밀 디바이스 핑거프린팅
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List
from enum import Enum
import hashlib
import json
import time


class Layer(Enum):
    """핑거프린팅 계층"""
    PHYSICAL = "physical"
    TEMPORAL = "temporal"
    BEHAVIORAL = "behavioral"


@dataclass
class FingerprintConfig:
    """핑거프린팅 설정"""
    layers: Dict[str, bool] = field(default_factory=lambda: {
        "physical": True,
        "temporal": True,
        "behavioral": False,
    })
    weights: Dict[str, float] = field(default_factory=lambda: {
        "physical": 0.5,
        "temporal": 0.3,
        "behavioral": 0.2,
    })
    timeout: int = 10000
    debug: bool = False


@dataclass
class Fingerprint:
    """핑거프린트 결과"""
    hash: str
    timestamp: float
    confidence: float
    modules: List[str]
    details: Optional[Dict[str, Any]] = None


@dataclass
class PhysicalSignature:
    """물리 계층 서명"""
    mems: Optional[Dict[str, Any]] = None
    clock_skew: Optional[Dict[str, Any]] = None


@dataclass
class TemporalSignature:
    """시간 계층 서명"""
    battery: Optional[Dict[str, Any]] = None
    performance: Optional[Dict[str, Any]] = None


@dataclass
class BehavioralSignature:
    """행동 계층 서명"""
    touch: Optional[Dict[str, Any]] = None
    keystroke: Optional[Dict[str, Any]] = None


class Fingerprinter:
    """
    메인 핑거프린터 클래스
    
    Usage:
        >>> from advanced_fingerprinting import Fingerprinter
        >>> fp = Fingerprinter()
        >>> result = fp.generate()
        >>> print(result.hash)
    """
    
    def __init__(self, config: Optional[FingerprintConfig] = None):
        self.config = config or FingerprintConfig()
    
    def generate(self, config: Optional[FingerprintConfig] = None) -> Fingerprint:
        """
        디바이스 핑거프린트 생성
        
        Args:
            config: 핑거프린팅 설정 (선택)
            
        Returns:
            Fingerprint: 생성된 핑거프린트
        """
        final_config = config or self.config
        modules: List[str] = []
        signatures: Dict[str, Any] = {}
        
        # Layer 1: Physical
        if final_config.layers.get("physical", True):
            signatures["physical"] = self._collect_physical_layer()
            modules.extend(["mems", "clock-skew"])
        
        # Layer 2: Temporal
        if final_config.layers.get("temporal", True):
            signatures["temporal"] = self._collect_temporal_layer()
            modules.extend(["battery", "performance"])
        
        # Layer 3: Behavioral
        if final_config.layers.get("behavioral", False):
            signatures["behavioral"] = self._collect_behavioral_layer()
            modules.extend(["touch", "keystroke"])
        
        # Generate hash
        hash_value = self._fuse_and_hash(signatures, final_config.weights)
        
        return Fingerprint(
            hash=hash_value,
            timestamp=time.time(),
            confidence=self._calculate_confidence(signatures),
            modules=modules,
            details=signatures if final_config.debug else None,
        )
    
    def _collect_physical_layer(self) -> Dict[str, Any]:
        """Physical Layer 수집 (서버사이드에서는 제한적)"""
        import platform
        import uuid
        
        return {
            "platform": platform.platform(),
            "processor": platform.processor(),
            "machine": platform.machine(),
            "node": str(uuid.getnode()),  # MAC 기반 노드
        }
    
    def _collect_temporal_layer(self) -> Dict[str, Any]:
        """Temporal Layer 수집"""
        import os
        
        return {
            "cpu_count": os.cpu_count(),
            "load_avg": getattr(os, 'getloadavg', lambda: (0, 0, 0))(),
            "timestamp": time.time(),
        }
    
    def _collect_behavioral_layer(self) -> Dict[str, Any]:
        """Behavioral Layer 수집 (서버사이드에서는 클라이언트 데이터 필요)"""
        return {}
    
    def _fuse_and_hash(
        self,
        signatures: Dict[str, Any],
        weights: Dict[str, float]
    ) -> str:
        """엔트로피 융합 및 해시 생성"""
        combined = json.dumps({
            "p": signatures.get("physical", {}),
            "t": signatures.get("temporal", {}),
            "b": signatures.get("behavioral", {}),
            "w": weights,
        }, sort_keys=True)
        
        return hashlib.sha256(combined.encode()).hexdigest()
    
    def _calculate_confidence(self, signatures: Dict[str, Any]) -> float:
        """신뢰도 계산"""
        score = 0.0
        
        if signatures.get("physical"):
            score += 0.4
        if signatures.get("temporal"):
            score += 0.35
        if signatures.get("behavioral"):
            score += 0.25
            
        return min(score, 1.0)


class Validator:
    """
    핑거프린트 검증기
    
    Usage:
        >>> from advanced_fingerprinting import Validator
        >>> validator = Validator()
        >>> result = validator.verify("hash123", "device_id")
    """
    
    def __init__(self, store: Optional[Any] = None):
        self._store: Dict[str, str] = {}
        self._external_store = store
    
    def register(self, device_id: str, fingerprint_hash: str) -> bool:
        """핑거프린트 등록"""
        self._store[device_id] = fingerprint_hash
        return True
    
    def verify(self, device_id: str, fingerprint_hash: str) -> Dict[str, Any]:
        """핑거프린트 검증"""
        stored_hash = self._store.get(device_id)
        
        if stored_hash is None:
            return {
                "is_valid": False,
                "reason": "device_not_found",
                "confidence": 0.0,
            }
        
        is_match = stored_hash == fingerprint_hash
        
        return {
            "is_valid": is_match,
            "reason": "match" if is_match else "mismatch",
            "confidence": 1.0 if is_match else 0.0,
        }


# 편의 함수
def get_fingerprint(config: Optional[FingerprintConfig] = None) -> Fingerprint:
    """간편 핑거프린트 생성 함수"""
    fp = Fingerprinter(config)
    return fp.generate()


__all__ = [
    "Fingerprinter",
    "Validator",
    "Fingerprint",
    "FingerprintConfig",
    "Layer",
    "get_fingerprint",
]

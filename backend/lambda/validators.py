"""
Input validation for EC2 Lambda handler.
All validators return a list of error strings — empty list means valid.
"""
from __future__ import annotations

import re

# ── Allowed values ────────────────────────────────────────────────────────

ALLOWED_INSTANCE_TYPES: frozenset[str] = frozenset({
    # T3 general purpose
    "t3.micro", "t3.small", "t3.medium", "t3.large", "t3.xlarge", "t3.2xlarge",
    # T3a (AMD)
    "t3a.micro", "t3a.small", "t3a.medium", "t3a.large",
    # M5 general purpose
    "m5.large", "m5.xlarge", "m5.2xlarge", "m5.4xlarge",
    # M6i (6th gen Intel)
    "m6i.large", "m6i.xlarge", "m6i.2xlarge", "m6i.4xlarge",
    # C5 compute-optimised
    "c5.large", "c5.xlarge", "c5.2xlarge", "c5.4xlarge",
    # C6i compute-optimised
    "c6i.large", "c6i.xlarge", "c6i.2xlarge",
    # R5 memory-optimised
    "r5.large", "r5.xlarge", "r5.2xlarge", "r5.4xlarge",
})

ALLOWED_VOLUME_TYPES: frozenset[str] = frozenset({
    "gp3", "gp2", "io1", "io2", "sc1", "st1",
})

MIN_VOLUME_GIB = 8
MAX_VOLUME_GIB = 16_384

# Patterns
_INSTANCE_NAME_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9\-_.]{0,254}$")
_INSTANCE_ID_RE   = re.compile(r"^i-[0-9a-f]{8,17}$")
_AMI_ID_RE        = re.compile(r"^ami-[0-9a-f]{8,17}$")


# ── Public API ────────────────────────────────────────────────────────────

def validate_create_instance(data: dict) -> list[str]:
    """
    Validate the request body for POST /instances.
    Returns a list of human-readable error messages.
    """
    errors: list[str] = []

    # Instance name
    name = str(data.get("instance_name", "")).strip()
    if not name:
        errors.append("instance_name is required")
    elif not _INSTANCE_NAME_RE.match(name):
        errors.append(
            "instance_name must start with a letter or digit and contain only "
            "letters, numbers, hyphens, underscores, or dots (max 255 chars)"
        )

    # AMI ID
    ami = str(data.get("ami_id", "")).strip()
    if not ami:
        errors.append("ami_id is required")
    elif not _AMI_ID_RE.match(ami):
        errors.append(f"ami_id '{ami}' is not a valid AMI ID (expected ami-xxxxxxxxxxxxxxxx)")

    # Instance type
    itype = str(data.get("instance_type", "")).strip()
    if not itype:
        errors.append("instance_type is required")
    elif itype not in ALLOWED_INSTANCE_TYPES:
        errors.append(
            f"instance_type '{itype}' is not in the allowed list. "
            f"Allowed: {', '.join(sorted(ALLOWED_INSTANCE_TYPES))}"
        )

    # Subnet
    if not str(data.get("subnet_id", "")).strip():
        errors.append("subnet_id is required")

    # Security group
    if not str(data.get("security_group_id", "")).strip():
        errors.append("security_group_id is required")

    # Root volume size
    vol = data.get("root_volume_size")
    if vol is not None:
        try:
            vol_int = int(vol)
            if not (MIN_VOLUME_GIB <= vol_int <= MAX_VOLUME_GIB):
                errors.append(
                    f"root_volume_size must be between {MIN_VOLUME_GIB} "
                    f"and {MAX_VOLUME_GIB} GiB (got {vol_int})"
                )
        except (TypeError, ValueError):
            errors.append("root_volume_size must be an integer")

    # Volume type
    vtype = str(data.get("root_volume_type", "gp3")).strip()
    if vtype and vtype not in ALLOWED_VOLUME_TYPES:
        errors.append(
            f"root_volume_type '{vtype}' is not allowed. "
            f"Allowed: {', '.join(sorted(ALLOWED_VOLUME_TYPES))}"
        )

    # Required tags
    tags = data.get("tags") or {}
    for key in ("Environment", "Owner", "Project"):
        if not str(tags.get(key, "")).strip():
            errors.append(f"tags.{key} is required")

    return errors


def validate_instance_id(instance_id: str) -> str | None:
    """Return an error string or None if the instance ID is valid."""
    if not instance_id:
        return "instance_id is required"
    if not _INSTANCE_ID_RE.match(instance_id):
        return (
            f"'{instance_id}' is not a valid EC2 instance ID "
            "(expected format: i-xxxxxxxxxxxxxxxxx)"
        )
    return None

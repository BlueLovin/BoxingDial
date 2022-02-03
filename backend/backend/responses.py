from rest_framework.response import Response


class BoxingDialResponses:
    BLOCKED_USER_RESPONSE = Response(
        {"error": "You have blocked this user.", "you_blocked": True}, status=400
    )

    USER_DOESNT_EXIST_RESPONSE = Response(
        {"error": "This user doesn't seem to exist. or maybe they blocked u lmfaoo"},
        status=400,
    )

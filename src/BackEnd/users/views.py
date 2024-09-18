from django.http import JsonResponse
from solders.keypair import Keypair
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA512
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

from .models import User


@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    seed_phrase = request.data.get('seed_phrase')
    password = request.data.get('password')

    if not username or not seed_phrase or not password:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    salt = get_random_bytes(16)
    iv = get_random_bytes(16)
    kdf = PBKDF2(password, salt, 32, count=1000000)
    cipher = AES.new(kdf, AES.MODE_GCM, nonce=iv)

    cipher_text = cipher.encrypt(seed_phrase.encode())
    encrypted_key = salt + iv + cipher_text

    keypair = Keypair.from_seed_phrase_and_passphrase(seed_phrase, password)

    hash_pubkey = SHA512.new()
    hash_pubkey.update(keypair.pubkey().to_json().encode())

    user = User.objects.create(
        public_key=hash_pubkey.hexdigest(),
        private_key=encrypted_key,
        username=username
    )

    token = Token.objects.create(user=user)

    return Response({'message': 'User created successfully', 'token': token.key})

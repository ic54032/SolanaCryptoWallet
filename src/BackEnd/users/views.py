from base64 import b64decode

from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from solders.keypair import Keypair

from rest_framework.decorators import api_view, authentication_classes, permission_classes
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


def encrypt_key(private_key_bytes, password):
    salt = get_random_bytes(16)
    iv = get_random_bytes(16)
    kdf = PBKDF2(password, salt, 32, count=1000000)
    cipher = AES.new(kdf, AES.MODE_GCM, nonce=iv)

    cipher_text = cipher.encrypt(private_key_bytes)
    return salt + iv + cipher_text


@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')
    private_key = request.data.get('private_key')
    
    if not username or not private_key or not password:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    private_key_bytes = b64decode(private_key)
    keypair = Keypair.from_bytes(private_key_bytes)

    encrypted_key = encrypt_key(private_key_bytes, password)

    hash_pubkey = SHA512.new()
    hash_pubkey.update(keypair.pubkey().to_json().encode())

    user = User(
        public_key=hash_pubkey.hexdigest(),
        password=encrypted_key,
        username=username
    )
    user.save()

    token = Token.objects.create(user=user)
    return Response({'message': 'User created successfully', 'token': token.key})


@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    user = get_object_or_404(User, username=username)
    salt = user.password[:16]
    iv = user.password[16:32]
    cipher_text = user.password[32:]

    kdf = PBKDF2(password, salt, 32, count=1000000)
    cipher = AES.new(kdf, AES.MODE_GCM, nonce=iv)

    try:
        private_key_bytes = cipher.decrypt(cipher_text)
    except:
        return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)

    keypair = Keypair.from_bytes(private_key_bytes)

    hash_pubkey = SHA512.new()
    hash_pubkey.update(keypair.pubkey().to_json().encode())

    if hash_pubkey.hexdigest() != user.public_key:
        return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)

    token, created = Token.objects.get_or_create(user=user)
    return Response({'message': 'Login successful', 'token': token.key})

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except:
        return Response({'error': 'Something went wrong'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user(request):
    return Response({'username': request.user.username})


@api_view(['POST'])
def check_public_key(request):
    public_key = request.data.get('public_key')

    hash_pubkey = SHA512.new()
    hash_pubkey.update(public_key.encode())

    if not public_key:
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(public_key=hash_pubkey.hexdigest()).exists():
        return Response({'message': 'Public key exists'})
    else:
        return Response({'error': 'Public key does not exist'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def recover(request):
    private_key = request.data.get('private_key')
    password = request.data.get('password')

    private_key_bytes = b64decode(private_key)
    keypair = Keypair.from_bytes(private_key_bytes)

    hash_pubkey = SHA512.new()
    hash_pubkey.update(keypair.pubkey().to_json().encode())

    if not User.objects.filter(public_key=hash_pubkey.hexdigest()).exists():
        return Response({'error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.get(public_key=hash_pubkey.hexdigest())
    encrypted_key = encrypt_key(private_key_bytes, password)

    user.password = encrypted_key
    user.save()

    token, created = Token.objects.get_or_create(user=user)
    return Response({'message': 'Wallet recovered successfully', 'token': token.key})
    
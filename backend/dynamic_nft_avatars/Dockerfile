FROM python:3.8

ENV POETRY_VERSION=1.1.11
ENV ENVIRONMENT=DEV
# Installing packages
RUN DEBIAN_FRONTEND=noninteractive apt-get update -y && apt-get install -y ffmpeg

RUN pip install "poetry==$POETRY_VERSION"

# Defining working directory and adding source code
WORKDIR /backend
COPY  ./dynamic_nft_avatars/poetry.lock ./dynamic_nft_avatars/pyproject.toml  /backend/

# Install API dependencies
RUN poetry config virtualenvs.create false
RUN poetry install -vvv

COPY . /backend
COPY /root/donft/DynamicAvatar/ipfs-kit /backend

# Start app
CMD ["python", "main.py"]
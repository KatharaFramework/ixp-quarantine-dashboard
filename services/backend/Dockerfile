FROM python:3.11-buster

RUN mkdir app
WORKDIR /app

ENV PATH="${PATH}:/root/.local/bin"
ENV PYTHONPATH=.

COPY requirements.txt .
COPY src/digital_twin/requirements.txt requirements-submodule.txt

RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip install -r requirements-submodule.txt

COPY src/ .
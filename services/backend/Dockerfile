FROM python:3.11-buster

RUN mkdir app
WORKDIR /app

ENV PATH="${PATH}:/root/.local/bin"
ENV PYTHONPATH=.

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN git clone https://github.com/KatharaFramework/ixp-digital-twin.git && \
    pip install -r ixp-digital-twin/requirements.txt && \
    rm -rf ixp-digital-twin

COPY src/ .
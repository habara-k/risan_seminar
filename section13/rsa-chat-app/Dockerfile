FROM python

RUN pip install responder

ENV PORT 5000

COPY . /responder-websocket-chat

WORKDIR /responder-websocket-chat

CMD ["python", "app.py"]

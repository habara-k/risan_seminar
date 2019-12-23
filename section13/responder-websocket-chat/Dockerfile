FROM python

RUN pip install responder

ENV PORT 5000
ENV WEBSOCKET ws://localhost

COPY . /responder-websocket-chat

WORKDIR /responder-websocket-chat

CMD ["python", "app.py"]

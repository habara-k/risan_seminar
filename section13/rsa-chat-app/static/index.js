$(function(){
  var protocol = (location.protocol == "http:" ? "ws:" : "wss:");
  const ws = new WebSocket(`${protocol}//${location.host}/ws`);

  function alertWithToast(message) {
    let toast = $(`
    <div class="toast" role="alert" data-delay="3000">
      <div class="toast-header">
        <strong class="mr-auto text-primary">RSA Chat</strong>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
          <span >&times;</span>
        </button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>`);
    $("#toastbox").append(toast);
    toast.toast('show');
  }

  const id = Math.floor(Math.random()*1000)
  ws.onopen = function() {
    ws.send(JSON.stringify({
      type: "normal",
      id: id,
      message: "Hello!",
    }));
  };

  ws.onmessage = function (e) {

    let data = JSON.parse(e.data);

    let tweet = $(`
        <div class="input-group input-group-sm mb-3">
          <div class="input-group-prepend">
          <span class="input-group-text">ID${data["id"]}</span>
        </div>`);

    var body;

    switch (data["type"]) {
      case "normal":
        body = $(`<input type="text" class="form-control" value="${data['message']}" readonly></input>`);
        tweet.append(body);
        break;

      case "encrypted":
        body = $(`
            <textarea class="form-control" rows="4" readonly>${data["message"]}</textarea>
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" type="button" data-toggle="tooltip" data-placement="bottom" title="Decrypt message">
              <i class="fas fa-file-import"></i>
              </button>
            </div>`)
        body.find("button").tooltip('show');

        body.find("button").click(function () {
          if (data["dst"]!=id) {
            alertWithToast("This message is not for you.");
            //return;
          }
          $("#encrypted_msg").val(data["encrypted"]);
        });
        tweet.append(body);
        break;

      case "key":
        body = $(`
            <textarea class="form-control" rows="4" readonly>${data["message"]}</textarea>
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" type="button" data-toggle="tooltip" data-placement="bottom" title="Send message to ID${data["id"]}">
                <i class="fas fa-file-import"></i>
              </button>
            </div>`)
        body.find("button").tooltip('show');
        body.find("button").click(function() {
          $("#dst_n").val(data["N"]);
          $("#dst_pub").val(data["Pub"]);
          $("#dst_id").val(data["id"]);
        })
        tweet.append(body);
        break;
    }
    $("#chat").prepend(tweet);

  };

  // エンターキーが押された場合メッセージを送信
  $("#textbox").on("keypress", function (e) {
    if (e.keyCode == 13 && $(this).val()) {
      ws.send(JSON.stringify({
        type: "normal",
        id: id,
        message: $(this).val(),
      }));
      $(this).val("");
    }
  });

  $("#save_and_tweet").click(function() {
    if ($("#my_n").val() == "") {
      alertWithToast("Please generete keys.");
      return;
    }
    ws.send(JSON.stringify({
      type: "key",
      id: id,
      N: $("#my_n").val(),
      Pub: $("#my_pub").val(),
      message: `N: ${$("#my_n").val()}\n\nPub: ${$("#my_pub").val()}`
    }));
  });

  $("#tweet_msg").click(function() {
    if ($("#sending_msg").val() == "") {
      alertWithToast("Please encrypt your message first.")
      return;
    }
    ws.send(JSON.stringify({
      type: "encrypted",
      id: id,
      dst: $("#dst_id").val(),
      encrypted: $("#sending_msg").val(),
      message: "@ID" + $("#dst_id").val() + ": " + $("#sending_msg").val(),
    }))
  });


  ////////////
  // utils  //
  ////////////

  function mod(a, m) {
    // return 0 <= a mod m < m
    return a.mod(m).add(m).mod(m);
  }

  function coprime(a, MIN_SIZE=2, N_TRIAL=100) {
    for (let i = 0; i < N_TRIAL; ++i) {
      let n = bigInt.randBetween(1<<MIN_SIZE, a.subtract(1));
      if (bigInt.gcd(a, n).equals(1)) {
        //console.log(`get coprime in ${i} times.`);
        return n;
      }
    }
    throw("coprime is not found.");
  }

  function extended_gcd(a, b) {
    if (b == 0) {
      return [bigInt(1), bigInt(0)];
    }

    let [x, y] = extended_gcd(b, mod(a, b));

    return [y, x.subtract(a.divide(b).multiply(y))];
  }


  ////////////
  // primes //
  ////////////

  function miller_rabin_test(n, q, k, w) {
    let x = w.modPow(q, n);
    if (x.equals(1) || x.equals(n.subtract(1))) {
      return true;
    }

    //for (let i = 1; k.greater(i); ++i) {
    for (let i = 1; i < k; ++i) {
      x = mod(x.multiply(x), n);

      if (x.equals(n.subtract(1))) return true;
      if (x.equals(1)) return false;
    }

    return false;
  }

  function is_prime(n, N_TEST=10) {
    if (n.equals(2)) return true;
    if (n.equals(1) || n.isEven()) return false;

    let q = n.subtract(1);
    let k = bigInt(0);

    while (q.isEven()) {
      q = q.shiftRight(1);
      k = k.add(1);
    }

    console.assert(
      n.subtract(1).equals(
        bigInt(1).shiftLeft(k).multiply(q)));

    for (let i = 0; i < N_TEST; ++i) {
      w = bigInt.randBetween(1, n.subtract(1));
      if (!miller_rabin_test(n, q, k, w)) {
        return false;
      }
    }

    return true;
  }

  function prime_in(min, max, N_TRIAL=10000) {
    // return prime in [min, max)

    for (let i = 0; i < N_TRIAL; ++i) {
      //n = randint(min, max);
      let n = bigInt.randBetween(min, max.subtract(1));
      if (is_prime(n)) {
        //console.log(`get prime in ${i} times`);
        return n;
      }
    }

    throw("prime is not found.");
  }


  ////////////
  // RSA    //
  ////////////

  function generate_keys(SECURE_KEY_SIZE=1024) {
    let min = bigInt(1).shiftLeft(SECURE_KEY_SIZE/2);
    let max = min.multiply(2);

    let p = prime_in(min, max);
    let q = prime_in(min, max);

    let n = p.multiply(q);
    let L = bigInt(p.subtract(1)).multiply(q.subtract(1));
    let pub = coprime(L);
    let [prv, _] = extended_gcd(pub, L);
    prv = mod(prv, L);


    console.assert(mod(pub.multiply(prv), L).equals(1));

    return [n, pub, prv];
  }

  function encrypt(plain_text, n, pub) {
    return plain_text.modPow(pub, n);
  }

  function decrypt(encrypted_text, n, prv) {
    return encrypted_text.modPow(prv, n);
  }

  function msg_to_int(message, CHAR_SIZE=8) {
    let value = bigInt();
    for (let i = 0; i < message.length; ++i) {
      value = value.shiftLeft(CHAR_SIZE);
      value = value.add(message.charCodeAt(i));
    }
    return value;
  }

  function int_to_msg(value, CHAR_SIZE=8) {
    let message = "";
    for (let v of value.toArray(1<<CHAR_SIZE)["value"]) {
      message += String.fromCharCode(v);
    }
    return message;
  }

  $("#generate_keys").click(function() {
    $(this).hide();
    $("#loading").show();
    setTimeout(function(){
      let [n, pub, prv] = generate_keys(SECURE_KEY_SIZE=8*128);
      $("#my_n").val(n.toString());
      $("#my_pub").val(pub.toString());
      $("#my_prv").val(prv.toString());
      $("#loading").hide();
      $("#generate_keys").show();
    },10);
  });

  $("#encrypt").click(function() {
    let msg = $("#plain_msg").val();

    if (msg == "") {
      alertWithToast("Please fill in sending message.");
      return;
    }
    if (!msg.match("^[a-zA-Z0-9!-/:-@¥[-`{-~ \n]*$")) {
      alertWithToast("Only half-width charactors are supported.")
      return;
    }
    if (msg.length > 128) {
      alertWithToast("Maximum message length is 128.");
      return;
    }
    if ($("#dst_id").val() == "") {
      alertWithToast("No destination is selected.");
      return;
    }

    let n = bigInt($("#dst_n").val());
    let pub = bigInt($("#dst_pub").val());
    let encrypted_value = encrypt(msg_to_int(msg), n, pub);
    $("#sending_msg").val(encrypted_value.toString());
  });

  $("#decrypt").click(function() {
    let encrypted_msg = $("#encrypted_msg").val();
    if (encrypted_msg == "") {
      alertWithToast("Please choose encrypted message.");
      return;
    }

    if ($("#my_n").val() == "") {
      alertWithToast("Please generate keys.");
      return;
    }
    let n = bigInt($("#my_n").val());
    let prv = bigInt($("#my_prv").val());
    let decrypted_value = decrypt(bigInt(encrypted_msg), n, prv);
    $("#decrypted_msg").val(int_to_msg(decrypted_value));
  });

});

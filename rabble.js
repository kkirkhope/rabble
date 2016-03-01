window.onload = function () {
  var
    in_minutes = document.getElementById('in_minutes'),
    in_break = document.getElementById('in_break'),
    in_new_member = document.getElementById('in_new_member'),
    btn_start = document.getElementById('btn_start'),
    btn_reset = document.getElementById('btn_reset'),
    ul_gang = document.getElementById('gang_list'),
    div_project = document.getElementById('project'),
    div_timer = document.getElementById('timer'),
    div_cycle = document.getElementById('cycle');
    div_scream = document.getElementById('screamout');

  var set_minutes = parseFloat(in_minutes.value);
  var set_break = parseInt(in_break.value);
  var members = [];
  var running = false;
  var paused = false;
  var notify = false;

  var driver, navigator;

  var seconds = 0;
  var cycle = 0;

  var memberId = function(el) {
    return parseInt(el.getAttribute('id').replace('member-',''));
  };

  var memberEl = function(id) {
    return document.getElementById('member-'+id);
  }

  var resetSeconds = function () {
    set_minutes = parseFloat(in_minutes.value);
    seconds = Math.floor(set_minutes * 60);
    updateTimer();
  };

  var updateTimer = function () {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
        secs = (secs < 10)? '0' + secs : secs;
    div_timer.textContent = mins + ':' + secs;
  };

  var updatePair = function () {
    if (members.length >= 2) {
      var nm = members.length;
      var navigator_id = cycle % nm;
      var driver_id = (cycle+1) % nm;
      navigator = members[navigator_id];
      driver = members[driver_id];
      members.forEach(function (v,i) { memberEl(i).classList.remove('driver', 'navigator') });
      memberEl(driver_id).classList.add('driver');
      memberEl(navigator_id).classList.add('navigator');
    }
  };

  var scream = function () {
    var scream_title;
    div_scream.classList.remove('hide', 'break', 'scream');
    if (cycle > 0 && cycle % set_break == 0) {
      div_scream.classList.add('break');
      scream_title = 'Why not take a break?';
    } else {
      div_scream.classList.add('scream');
      scream_title = 'Rotate!';
    }

    var scream_body;
    if (members.length >= 2) {
      scream_body = 'Driver: '+driver+', Navigator: '+navigator;
    } else {
      scream_body = 'Get more mobbers!';
    }

    div_scream.innerHTML = scream_title + '<br><br>' + scream_body;

    if (notify) {
      var notification = new Notification(scream_title, {'body':scream_body});
    }
  };

  var updateCycle = function () {
    if (seconds % (set_minutes * 60) === 0) {
      resetSeconds();
      pause('Continue');
      updatePair();
      scream();
      cycle++;
    }
    div_cycle.textContent = 'Cycle #' + cycle;
  };

  var updateList = function () {
    while (ul_gang.firstChild) ul_gang.removeChild(ul_gang.firstChild);

    members.forEach(function (name, id) {
      var li = document.createElement('li');
      li.textContent = name;
      li.classList.add('member_item');
      li.setAttribute('draggable', 'true');
      li.setAttribute('id', 'member-'+id);

      // Double click - delete
      li.addEventListener('dblclick', function () {
        var el_id = memberId(li);
        members.splice(el_id, 1);
        updateList();
      });

      ul_gang.appendChild(li);
    });
  };

  var update = function () {
    if (running && !paused) {
      updateCycle();
      updateTimer();
      seconds--;
    }
    window.setTimeout(update, 1000);
  };

  var unpause = function () {
    paused = false;
    btn_start.textContent = 'Pause';
    div_scream.classList.add('hide');
  };

  var pause = function (txt) {
    paused = true;
    btn_start.textContent = (txt)? txt:'Unpause';
  };

  var start = function () {
    running = true;
    cycle = 0;
    unpause();
    resetSeconds();
  };

  var reset = function () {
    running = false;
    btn_start.textContent = 'Start';
    div_scream.classList.add('hide');
    resetSeconds();
  };

  var hitStart = function () {
    if (running) {
      if (paused) {
        unpause();
      } else {
        pause();
      }
    } else {
      start();
    }
  };

  btn_start.addEventListener('click', hitStart);

  btn_reset.addEventListener('click', function () {
    reset();
  });

  in_minutes.addEventListener('change', function () {
    if (!running) {
      resetSeconds();
      updateTimer();
    }
  });

  in_break.addEventListener('change', function () {
    if (!running) {
      set_break = parseInt(in_break.value);
    }
  });

  in_new_member.addEventListener('change', function () {
    var name = in_new_member.value.trim();
    if (name) {
      in_new_member.value = '';
      members.push(name);
      updateList();
    }
  });

  reset();
  updateTimer();
  update();

  if ("Notification" in window) {
    if (Notification.permission === 'granted') {
      notify = true;
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        notify = permission === 'granted';
      });
    }
  }

  var dragged;

  document.body.addEventListener('keyup', function (e) {
    if (e.keyCode === 32) {
      e.preventDefault();
      hitStart();
    }
  });

  document.addEventListener('dragstart', function (e) {
    dragged = e.target;
    if (dragged.classList.contains('member_item')) {
      name = members[memberId(dragged)];
      e.dataTransfer.setData('text/plain', name);
      e.dataTransfer.setDragImage(dragged, 0, 0);
      dragged.style.opacity = 0.5;
    }
  });

  document.addEventListener('dragend', function (e) {
    dragged = e.target;
    if (dragged.classList.contains('member_item')) {
      dragged.style.opacity = '';
    }
  });

  document.addEventListener('dragover', function (e) {
    var target = e.target;
    if (target.classList.contains('member_item') && target != dragged) {
      e.preventDefault();
    }
  });

  document.addEventListener('dragenter', function (e) {
    var target = e.target;
    if (target.classList.contains('member_item') && target != dragged) {
      e.preventDefault();
      target.style.marginBottom = '30px';
    }
  });

  document.addEventListener('dragleave', function (e) {
    var target = e.target;
    if (target.classList.contains('member_item') && target != dragged) {
      target.style.marginBottom = '';
    }
  });

  document.addEventListener('drop', function (e) {
    e.preventDefault();
    var target = e.target;
    if (target.classList.contains('member_item') && target != dragged) {
      var name = e.dataTransfer.getData('text/plain');
      var dragged_id = memberId(dragged);
      var target_id = memberId(target);
      if (dragged_id > target_id) {
        members.splice(dragged_id, 1);
        members.splice(target_id+1, 0, name);
      } else {
        members.splice(target_id+1, 0, name);
        members.splice(dragged_id, 1);
      }
      target.style.marginBottom = '';
      updateList();
      updateCycle();
    }
  });
};

/* ============================================================
   회의 잡기 프로토타입 — 라우터 & 인터랙션
   - data-nav="페이지id" 로 화면 전환 (해시 라우팅, 뒤로가기 지원)
   - 화면별 설계 근거를 데스크톱 패널에 동기화
   ============================================================ */

(function () {
  /* ---------- 화면별 설계 근거 (데스크톱 패널) ---------- */
  var RATIONALE = {
    "p-home": {
      t: "일정 조율의 고통은<br/>죄책감입니다",
      b: ["<b>회의는 제목이 아니라 시간으로</b> 식별돼요. 만들 때 제목을 안 받은 절제가 여기서 보상받아요.",
          "<b>'답할 차례'까지 홈에.</b> 조율은 양방향이라, 응답자 경험까지 닫아야 문제 전체가 풀려요.",
          "홈의 One Thing은 <b>새 회의 잡기</b> 하나. 목록은 확인용이에요."]
    },
    "p-create": {
      t: "결정은 하나,<br/>누가 얼마나 중요한가",
      b: ["회의 길이·마감은 결정이 아니라 <b>조건</b>이라 칩으로 내렸어요.",
          "기본값은 전원 '꼭'. <b>빼도 되는 사람만 한 번 탭</b> — 실수 비용이 낮은 쪽이 기본이에요.",
          "'필수/선택' 대신 <b>사람 말</b>로. 이 말투가 추천 화면까지 이어져요."]
    },
    "p-add": {
      t: "검색은<br/>예외 처리입니다",
      b: ["대부분의 참석자는 <b>우리 팀 아니면 최근 협업자</b>예요. 그 둘을 먼저 깔았어요.",
          "조직 협업 데이터로 <b>입력 비용을 0에 가깝게</b>.",
          "탭 한 번 = 선택/해제. 버튼이 <b>몇 명인지 대신 세요</b>."]
    },
    "p-collecting": {
      t: "묻지 말고,<br/>이미 아는 걸 쓴다",
      b: ["같은 회사 = 같은 캘린더. <b>빈 시간은 안 물어봐요.</b>",
          "'제목은 안 보고 비어 있는지만' — <b>프라이버시 안심</b>이 신뢰를 만들어요.",
          "필수 4명이 답했으면 <b>기다리지 않고 전진</b>할 수 있어요."]
    },
    "p-tap": {
      t: "입력이 아니라<br/>반응입니다",
      b: ["시스템이 후보를 좁혔으니 동료는 <b>안 되는 시간만 탭</b>해요. 결정 0~3번.",
          "'빼고 싶은 사람만 탭'(만들기)과 같은 <b>예외만 짚는 손동작</b>.",
          "셋 다 안 맞아도 <b>출구</b>가 있어요 — 되는 시간 알려주기."]
    },
    "p-recommend": {
      t: "막다른 길을<br/>거래로 바꿉니다",
      b: ["빈 시간을 나열하지 않고 <b>하나를 책임지고</b> 제시해요.",
          "못 오는 사람을 숨기지 않되 <b>누구의 잘못도 아니게</b> 프레이밍해요.",
          "전원이 안 될 때가 기본 시나리오 — 시스템이 <b>'30분 조정' 거래</b>를 만들어 쥐여줘요."]
    },
    "p-ask": {
      t: "부탁의 감정노동을<br/>시스템이 대신",
      b: ["'옮겨줘'는 가장 쓰기 싫은 말이라 <b>시스템이 부드럽게 대필</b>해요.",
          "박지후님껜 <b>'어려우면 목요일로'라는 출구</b>를 — 압박이 아닌 쉬운 예스.",
          "주최자에게도 '그냥 목요일로'를 남겨 <b>안 밀어붙일 자유</b>를 줘요."]
    },
    "p-waiting": {
      t: "기다림을<br/>불안하게 만들지 않기",
      b: ["<b>어느 쪽이든 회의는 열려요.</b> 조정은 손해 없는 +1이에요.",
          "대기 화면에 강한 CTA가 없는 건 <b>의도</b> — 최선이 '기다리기'니까요.",
          "읽음 표시가 <b>다시 알림 여부의 판단 근거</b>가 돼요."]
    },
    "p-confirmed": {
      t: "확정은<br/>안심의 순간",
      b: ["캘린더 등록·알림을 <b>시스템이 한 번에</b> — 마지막 감정노동까지 제거.",
          "주행동은 <b>완료(출구)</b>. 공유는 보조로 내렸어요.",
          "'강수아님은 빠져도 괜찮아요'로 <b>감정 아크가 완결</b>돼요."]
    },
    "p-reschedule": {
      t: "한 번 한 일을<br/>두 번 시키지 않기",
      b: ["캘린더를 이미 아니 <b>대안을 즉시</b> 제시 — 처음부터 다시가 아니에요.",
          "바꾸면 <b>몇 명이 줄어드는지 손해까지</b> 정직하게.",
          "'역시 그대로 둘게요' — <b>변경 자체도 되돌릴 수 있어요</b>."]
    },
    "p-rescheduled": {
      t: "끝난 것과<br/>기다리는 것을 가른다",
      b: ["알림·캘린더는 완료(✓), 박지후님 조정은 <b>대기(🕐)</b> — 상태를 섞지 않아요.",
          "'조정하면 전원'은 약속이 아니라 <b>조건문</b> — 과장하지 않는 게 신뢰예요.",
          "안 돼도 5명 확정 — <b>막다른 길 없음</b>이 끝까지 지켜져요."]
    }
  };

  var rTitle = document.getElementById("r-title");
  var rBody = document.getElementById("r-body");

  function syncRationale(id) {
    var r = RATIONALE[id];
    if (!r || !rTitle) return;
    rTitle.innerHTML = r.t;
    rBody.innerHTML = "<ol class='rationale-ol'>" + r.b.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>";
  }

  /* ---------- 라우터 ---------- */
  var pages = document.querySelectorAll(".page");
  var screen = document.getElementById("screen");

  function show(id, push) {
    var target = document.getElementById(id);
    if (!target) return;
    pages.forEach(function (p) { p.hidden = true; p.classList.remove("page-in"); });
    target.hidden = false;
    // 리플로우 후 진입 모션
    void target.offsetWidth;
    target.classList.add("page-in");
    screen.scrollTop = 0;
    syncRationale(id);
    if (push !== false) history.replaceState(null, "", "#" + id);
  }

  /* ---------- 토스트: 행동의 결과를 즉시 말해주기 ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  document.addEventListener("click", function (e) {
    var nav = e.target.closest("[data-nav]");
    if (nav) {
      show(nav.getAttribute("data-nav"));
      var t = nav.getAttribute("data-toast");
      if (t) toast(t);
      return;
    }

    /* 필수/선택 토글 */
    var tog = e.target.closest("[data-toggle]");
    if (tog) {
      var isMust = tog.classList.contains("must");
      tog.classList.toggle("must", !isMust);
      tog.classList.toggle("opt", isMust);
      tog.textContent = isMust ? "안 와도 돼요 ⇄" : "꼭 와야 해요 ⇄";
      return;
    }

    /* 주소록 체크 */
    var chk = e.target.closest("[data-check]");
    if (chk) {
      chk.classList.toggle("sel");
      var n = document.querySelectorAll("#p-add .prow.sel").length;
      var cta = document.getElementById("add-cta");
      cta.textContent = n > 0 ? n + "명 추가" : "추가할 사람을 골라요";
      cta.classList.toggle("is-dim", n === 0);
      return;
    }

    /* 동료 슬롯: 안 되는 시간만 탭 */
    var slot = e.target.closest("[data-slot]");
    if (slot) {
      var bad = slot.classList.toggle("bad");
      slot.querySelector(".tstate").textContent = bad ? "✕ 이 시간은 어려워요" : "✓ 괜찮아요";
      return;
    }

    /* 다시 알림: 한 번 보내면 잠가서 채근 방지 */
    if (e.target.closest("#remind-btn")) {
      var rb = document.getElementById("remind-btn");
      rb.textContent = "✓ 알림을 보냈어요";
      rb.classList.add("is-sent");
      toast("박지후님께 다시 알렸어요");
      return;
    }

    /* 셋 다 안 맞을 때: 되는 시간 직접 알려주기 */
    if (e.target.closest("#freeform-toggle")) {
      var ff = document.getElementById("freeform");
      ff.classList.toggle("open");
      if (ff.classList.contains("open")) ff.querySelector("input").focus();
      return;
    }

    /* 시간 바꾸기 라디오 */
    var pick = e.target.closest("[data-pick]");
    if (pick) {
      document.querySelectorAll("#p-reschedule .radio").forEach(function (r) { r.classList.remove("on"); });
      pick.classList.add("on");
      document.getElementById("impact").innerHTML =
        "<p><b>" + pick.getAttribute("data-pick") + ".</b> 5명에게 새 시간을 다시 알려줄게요.</p>";
      var cta2 = document.getElementById("resched-cta");
      cta2.textContent = pick.querySelector(".alt-time").textContent + "로 바꾸기";
      cta2.classList.remove("is-dim");
      return;
    }
  });

  /* ---------- 주소록 실시간 검색 ---------- */
  var searchInput = document.querySelector("#p-add .search");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var q = this.value.trim().toLowerCase();
      document.querySelectorAll("#p-add .prow").forEach(function (row) {
        var name = row.querySelector(".pinfo").textContent.toLowerCase();
        row.style.display = name.indexOf(q) > -1 ? "" : "none";
      });
    });
  }

  /* 해시 진입 지원 */
  var initial = location.hash ? location.hash.slice(1) : "p-home";
  show(document.getElementById(initial) ? initial : "p-home", false);
})();

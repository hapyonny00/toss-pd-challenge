/* 추천 화면 마이크로 인터랙션
   - 주 CTA: 누르면 '잡는 중 → 잡혔어요' 상태 전이 (프로토타입 데모)
   - 실제 제품에서는 확정 화면으로 라우팅됩니다. */

(function () {
  var primary = document.querySelector(".btn-primary");
  if (!primary) return;

  var original = primary.textContent;
  var done = false;

  primary.addEventListener("click", function () {
    if (done) return;
    done = true;
    primary.disabled = true;
    primary.textContent = "잡는 중…";

    setTimeout(function () {
      primary.textContent = "잡혔어요 ✓";
      primary.style.background = "var(--green-500)";

      setTimeout(function () {
        primary.textContent = original;
        primary.style.background = "";
        primary.disabled = false;
        done = false;
      }, 1600);
    }, 700);
  });
})();

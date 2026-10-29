`timescale 1ns/1ps
module scheduling_examples;
  reg q = 0;
  initial begin
    fork
      q <= 1'b1;
    join_none
    #0 disable fork;
    #1;
    if (q !== 1'b1) $fatal(1, "queued NBA was lost");
    $display("NBA_DISABLE_FORK_PASS q=%b time=%0t", q, $time);
  end
`ifndef ICARUS
  event e;
  bit woke = 0;
  initial begin
    @(e);
    woke = 1;
    $display("EVENT_WAKE time=%0t", $time);
  end
  initial begin
    #10 ->> e;
    #1;
    if (!woke) $fatal(1, "nonblocking event did not wake waiter");
    $display("NONBLOCKING_EVENT_PASS");
  end
`endif
  initial #20 $finish;
endmodule

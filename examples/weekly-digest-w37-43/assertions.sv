`timescale 1ns/1ps
module assertion_examples;
  bit clk = 0;
  always #5 clk = ~clk;
  bit req = 0, gnt = 0, ack = 0, err = 0;
  bit rst_n = 1, start = 0, done = 0;
  int response_failures = 0, done_failures = 0;
  a_rsp: assert property (@(posedge clk) req ##1 gnt |-> ack || err)
    else response_failures++;
  a_done: assert property (@(posedge clk) disable iff (!rst_n) start |-> ##[1:4] done)
    else done_failures++;
  initial begin
    // Positive response path, followed by the required negative control.
    @(negedge clk); req = 1;
    @(negedge clk); req = 0; gnt = 1; ack = 1;
    @(negedge clk); gnt = 0; ack = 0;
    @(negedge clk); req = 1;
    @(negedge clk); req = 0; gnt = 1;
    @(negedge clk); gnt = 0;
    #1;
    if (response_failures != 1) $fatal(1, "expected one response assertion failure, got %0d", response_failures);
    $display("RESPONSE_NEGATIVE_CONTROL_PASS failures=%0d", response_failures);

    // Pending attempt, asynchronous reset exactly at a clock edge.
    @(negedge clk); start = 1;
    @(negedge clk); start = 0;
    @(posedge clk); rst_n <= 0;
    repeat (5) @(negedge clk);
    if (done_failures != 0) $fatal(1, "edge reset failed to abort");
    rst_n = 1;
    // Reset pulse occurs entirely between clock edges.
    @(negedge clk); start = 1;
    @(negedge clk); start = 0;
    #1 rst_n = 0;
    #2 rst_n = 1;
    repeat (5) @(negedge clk);
    if (done_failures != 0) $fatal(1, "between-edge reset failed to abort");
    // Re-enable and deliberately violate the property.
    start = 1;
    @(negedge clk); start = 0;
    repeat (6) @(negedge clk);
    if (done_failures != 1) $fatal(1, "reset release did not re-enable assertion, got %0d", done_failures);
    $display("DISABLE_IFF_PASS failures=%0d", done_failures);
    $finish;
  end
endmodule

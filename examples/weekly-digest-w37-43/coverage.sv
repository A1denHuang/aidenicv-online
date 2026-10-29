module coverage_examples;
  covergroup threshold_cg with function sample(int value);
    option.per_instance = 1;
    option.at_least = 4;
    cp: coverpoint value { bins selected = {1}; }
    other: coverpoint value { bins selected = {1}; }
    pair: cross cp, other;
  endgroup
  covergroup transition_cg with function sample(int state);
    option.per_instance = 1;
    cp: coverpoint state {
      bins idle_to_busy = (0 => 1);
      bins busy_run = (1 [*3]);
      bins busy_to_any = (1 => 0, 2);
    }
  endgroup
  covergroup average_cg with function sample(int value);
    option.per_instance = 1;
    option.get_inst_coverage = 1;
    cp: coverpoint value { bins values[] = {[0:3]}; }
  endgroup
  covergroup merged_cg with function sample(int value);
    option.per_instance = 1;
    option.get_inst_coverage = 1;
    type_option.merge_instances = 1;
    cp: coverpoint value { bins values[] = {[0:3]}; }
  endgroup
  threshold_cg t3 = new(), t4 = new(), t5 = new();
  transition_cg single_busy = new(), idle_busy = new(), four_busy = new(), repeated_idle = new();
  average_cg avg_a = new(), avg_b = new();
  merged_cg merge_a = new(), merge_b = new();
  initial begin
    repeat (3) t3.sample(1);
    repeat (4) t4.sample(1);
    repeat (5) t5.sample(1);
    $display("THRESHOLD %0.2f %0.2f %0.2f", t3.get_inst_coverage(), t4.get_inst_coverage(), t5.get_inst_coverage());
    if (t3.get_inst_coverage() != 0 || t4.get_inst_coverage() != 100 || t5.get_inst_coverage() != 100) $fatal(1, "threshold group");
    if (t3.cp.get_inst_coverage() != 0 || t4.cp.get_inst_coverage() != 100 || t5.cp.get_inst_coverage() != 100) $fatal(1, "threshold point");
    if (t3.pair.get_inst_coverage() != 0 || t4.pair.get_inst_coverage() != 100 || t5.pair.get_inst_coverage() != 100) $fatal(1, "threshold cross");
    single_busy.sample(1);
    idle_busy.sample(0); idle_busy.sample(1);
    repeat (4) four_busy.sample(1);
    repeated_idle.sample(0); repeated_idle.sample(0); repeated_idle.sample(1);
    avg_a.sample(0); avg_a.sample(1); avg_b.sample(2); avg_b.sample(3);
    merge_a.sample(0); merge_a.sample(1); merge_b.sample(2); merge_b.sample(3);
    $display("MERGE type=%0.2f/%0.2f instance=%0.2f/%0.2f", avg_a.get_coverage(), merge_a.get_coverage(), avg_a.get_inst_coverage(), merge_a.get_inst_coverage());
    if (avg_a.get_coverage() != 50 || merge_a.get_coverage() != 100 || avg_a.get_inst_coverage() != 50 || merge_a.get_inst_coverage() != 50) $fatal(1, "instance merge");
    $display("COVERAGE_EXAMPLES_PASS");
    $finish;
  end
endmodule

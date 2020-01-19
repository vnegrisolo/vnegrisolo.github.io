 class ErgZone::WorkoutMode do
   def self.run(intervals)
-    first_type = intervals[0].type
-    first_rest = intervals[0].rest
+    first_interval = intervals[0]
+    last_interval = intervals[-1]
+    intervals = intervals[0..-2]
 
-    same_type = intervals.all? do |interval|
-      interval.type == first_type
+    same_interval = intervals.all? do |interval|
+      interval.type == first_interval.type &&
+        interval.value == first_interval.value &&
+        interval.rest == first_interval.rest
     end
 
-    same_rest = intervals.all? do |interval|
-      interval.rest == first_rest
-    end
+    first_bigger_than_last = 
+      first_interval.value >= last_interval.value &&
+        first_interval.rest >= last_interval.rest
 
-    if same_type && same_rest
-      with_rest = first_rest > 0
+    if same_interval && first_bigger_than_last
+      with_rest = first_interval.rest > 0
 
-      if first_type == "dist"
+      if first_interval.first_type == "dist"
         if with_rest
           "FixedDistInterval"
         else
           "FixedDistSplits"
         end
       else
         if with_rest
           "FixedTimeInterval"
         else
           "FixedTimeSplits"
         end
       end
     else
       "VariableInterval"
     end
   end
 end

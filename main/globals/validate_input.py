#check non-negative integer, zero is included
def is_non_negative_int(num):
    if isinstance(num, int) and num >= 0:
        return True
    else:
        return False

#check if non-negative float with at most # of decimal places, zero is included
def is_non_negative_float(num, decimal_places=2):
    if isinstance(num, (int, float)) and num >= 0:
        # Check if the number has at most 2 decimal places
        if isinstance(num, float):
            decimal_part = str(num).split(".")[1] if "." in str(num) else ""
            if len(decimal_part) > decimal_places:
                return False
        return True
    else:
        return False



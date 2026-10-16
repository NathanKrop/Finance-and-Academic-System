do $$
begin
  if exists (
    select payment_type_id, lower(btrim(ref_no))
    from transactions
    where voided = false
      and ref_no is not null
      and btrim(ref_no) <> ''
    group by payment_type_id, lower(btrim(ref_no))
    having count(*) > 1
  ) then
    raise exception 'Resolve duplicate active payment references before applying transaction_reference_guard';
  end if;
end;
$$;

create unique index if not exists transactions_active_payment_reference_uidx
  on transactions (payment_type_id, lower(btrim(ref_no)))
  where voided = false
    and ref_no is not null
    and btrim(ref_no) <> '';

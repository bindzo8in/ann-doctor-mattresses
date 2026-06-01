"use client";
import * as z from "zod";
import { ProductInput, productSchema } from "@/lib/schema/product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { motion } from "motion/react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import {
  FormHeader,
  FormFooter,
  StepFields,
  PreviousButton,
  NextButton,
  SubmitButton,
  MultiStepFormContent,
} from "@/components/multi-step-viewer";
import { MultiStepFormProvider } from "@/hooks/use-multi-step-viewer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

//------------------------------

const defaultValues = {
  name: "",
  shortDescription: null,
  description: "",
  categoryId: "",
  thumbnail: "",
  images: [],
  isFeatured: false,
  isActive: true,
};

export function ProductForm() {
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });
  const {
    formState: { isSubmitting, isSubmitSuccessful },
  } = form;

  const handleSubmit = form.handleSubmit(async (data: ProductInput) => {
    try {
      // TODO: implement form submission
      console.log(data);
      form.reset();
    } catch (error) {
      // TODO: handle error
    }
  });

  const stepsFields = [
    {
      fields: ["name", "shortDescription", "description"],
      component: (
        <div className="flex flex-col gap-4 w-full">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1 w-full">
                <FieldLabel htmlFor="name">Name *</FieldLabel>
                <Input
                  {...field}
                  id="name"
                  type="text"
                  onChange={(e) => field.onChange(e.target.value)}
                  aria-invalid={fieldState.invalid}
                  placeholder="ex. Royal Top Mattress"
                  className="w-full"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <FieldSeparator />

          <Controller
            name="shortDescription"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1 w-full [&_p]:pb-2">
                <FieldLabel htmlFor="shortDescription">Short Description</FieldLabel>
                <TagInput
                  tags={field.value ?? []}
                  setTags={(tags) => field.onChange(tags)}
                  id="shortDescription"
                  placeholder=""
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1 w-full">
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="description"
                  placeholder=""
                  className="w-full min-h-[120px] resize-y"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      ),
    },
    {
      fields: ["thumbnail", "images"],
      component: (
        <div className="flex flex-col gap-6 w-full">
          <Controller
            name="thumbnail"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="w-full">
                <Field data-invalid={fieldState.invalid} className="gap-1 w-full">
                  <FieldLabel htmlFor="thumbnail">Thumbnail *</FieldLabel>
                  <FieldDescription>
                    Select a file to upload from your device
                  </FieldDescription>
                  <FileUpload
                    {...field}
                    setValue={form.setValue}
                    name="thumbnail"
                    placeholder="PNG, JPEG or Webp, (max. 5MB)"
                    accept="image/png, image/jpeg, image/webp"
                    maxFiles={1}
                    maxSize={5242880}
                  />
                </Field>
                {Array.isArray(fieldState.error) ? (
                  fieldState.error?.map((error, i) => (
                    <p key={i} role="alert" data-slot="field-error" className="text-destructive text-sm">
                      {error.message}
                    </p>
                  ))
                ) : (
                  <FieldError errors={[fieldState.error]} />
                )}
              </div>
            )}
          />

          <Controller
            name="images"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="w-full">
                <Field data-invalid={fieldState.invalid} className="gap-1 w-full">
                  <FieldLabel htmlFor="images">Product Images *</FieldLabel>
                  <FieldDescription>
                    Select a file to upload from your device
                  </FieldDescription>
                  <FileUpload
                    {...field}
                    setValue={form.setValue}
                    name="images"
                    placeholder="PNG, JPEG or Webp, (max. 5MB)"
                    accept="image/png, image/jpeg, image/webp"
                    maxFiles={5}
                    maxSize={5242880}
                  />
                </Field>
                {Array.isArray(fieldState.error) ? (
                  fieldState.error?.map((error, i) => (
                    <p key={i} role="alert" data-slot="field-error" className="text-destructive text-sm">
                      {error.message}
                    </p>
                  ))
                ) : (
                  <FieldError errors={[fieldState.error]} />
                )}
              </div>
            )}
          />
        </div>
      ),
    },
    {
      fields: ["categoryId", "isFeatured", "isActive"],
      component: (
        <div className="flex flex-col gap-4 w-full">
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field, fieldState }) => {
              const options = [
                { value: "arabic", label: "Arabic" },
                { value: "english", label: "English" },
                { value: "turkish", label: "Turkish" },
                { value: "russian", label: "Russian" },
                { value: "korean", label: "Korean" },
                { value: "chinese", label: "Chinese" },
                { value: "german", label: "German" },
                { value: "spanish", label: "Spanish" },
              ];
              return (
                <Field data-invalid={fieldState.invalid} className="gap-2 w-full">
                  <FieldLabel htmlFor="categoryId">Select Category *</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between active:scale-100",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? options.find((o) => o.value === field.value)?.label
                          : "tap to search category"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-[var(--radix-popper-anchor-width)]"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="tap to search..." className="h-10" />
                        <CommandList>
                          <CommandEmpty>No items found.</CommandEmpty>
                          <CommandGroup>
                            {options.map(({ label, value }) => (
                              <CommandItem
                                value={value}
                                key={value}
                                onSelect={() => form.setValue("categoryId", value)}
                              >
                                {label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    value === field.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />

          <FieldSeparator />

          {/* Checkboxes: stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Controller
              name="isFeatured"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isFeatured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldLabel htmlFor="isFeatured">Featured *</FieldLabel>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="isActive"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldLabel htmlFor="isActive">Active *</FieldLabel>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </div>
      ),
    },
  ];

  if (isSubmitSuccessful) {
    return (
      <div className="p-4 sm:p-6 md:p-10 w-full rounded-md border">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, stiffness: 300, damping: 25 }}
          className="h-full py-6 px-3"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 15 }}
            className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2"
          >
            <Check className="size-8" />
          </motion.div>
          <h2 className="text-center text-2xl text-pretty font-bold mb-2">
            Thank you
          </h2>
          <p className="text-center text-lg text-pretty text-muted-foreground">
            Form submitted successfully, we will get back to you soon
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-0">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col p-4 sm:p-6 md:p-8 w-full mx-auto rounded-md max-w-3xl gap-4 border"
      >
        <MultiStepFormProvider
          stepsFields={stepsFields}
          onStepValidation={async (step) => {
            const isValid = await form.trigger(
              step.fields as Array<keyof ProductInput>,
            );
            return isValid;
          }}
        >
          <MultiStepFormContent>
            <FormHeader />
            <StepFields />
            <FormFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <PreviousButton className="w-full sm:w-auto">
                <ChevronLeft />
                Previous
              </PreviousButton>
              <NextButton className="w-full sm:w-auto">
                Next <ChevronRight />
              </NextButton>
              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </SubmitButton>
            </FormFooter>
          </MultiStepFormContent>
        </MultiStepFormProvider>
      </form>
    </div>
  );
}

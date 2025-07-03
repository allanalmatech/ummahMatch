
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search as SearchIcon } from "lucide-react";

export function SearchForm() {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Find Your Match</CardTitle>
        <CardDescription>Use the filters below to refine your search.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-semibold border-b pb-2">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gender">I'm looking for a</Label>
                <Select name="gender">
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Age Range</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" name="minAge" placeholder="Min" aria-label="Minimum age" />
                  <span>-</span>
                  <Input type="number" name="maxAge" placeholder="Max" aria-label="Maximum age" />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="marital-status">Marital Status</Label>
                <Select name="maritalStatus">
                  <SelectTrigger id="marital-status">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-semibold border-b pb-2">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="country">Living In</Label>
                    <Input id="country" name="country" placeholder="e.g. United Kingdom" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" placeholder="e.g. London" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" name="nationality" placeholder="e.g. British" />
                </div>
            </div>
          </div>

          {/* Section 3: Appearance */}
          <div className="space-y-4">
             <h3 className="font-headline text-lg font-semibold border-b pb-2">Appearance & Ethnicity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="appearance">Appearance</Label>
                    <Input id="appearance" name="appearance" placeholder="e.g. Slim, Athletic" />
                </div>
                 <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <div className="flex items-center gap-2">
                        <Input type="number" name="minHeight" placeholder="Min" aria-label="Minimum height" />
                        <span>-</span>
                        <Input type="number" name="maxHeight" placeholder="Max" aria-label="Maximum height" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <div className="flex items-center gap-2">
                        <Input type="number" name="minWeight" placeholder="Min" aria-label="Minimum weight" />
                        <span>-</span>
                        <Input type="number" name="maxWeight" placeholder="Max" aria-label="Maximum weight" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="ethnicity">Ethnicity / Tribe</Label>
                    <Input id="ethnicity" name="ethnicity" placeholder="e.g. Yoruba, Punjabi" />
                </div>
            </div>
          </div>
          
           {/* Section 4: Lifestyle */}
          <div className="space-y-4">
             <h3 className="font-headline text-lg font-semibold border-b pb-2">Lifestyle & Background</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="lifestyle">Lifestyle</Label>
                    <Input id="lifestyle" name="lifestyle" placeholder="e.g. Active, Homebody" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="smoking">Smoking</Label>
                    <Select name="smoking">
                        <SelectTrigger id="smoking"><SelectValue placeholder="Any" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="sometimes">Sometimes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="drinking">Drinking</Label>
                     <Select name="drinking">
                        <SelectTrigger id="drinking"><SelectValue placeholder="Any" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="children">Number of Children</Label>
                    <Input id="children" name="children" type="number" placeholder="Any" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input id="occupation" name="occupation" placeholder="e.g. Doctor" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="homeStatus">Living Situation</Label>
                    <Input id="homeStatus" name="homeStatus" placeholder="e.g. Lives alone" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input id="education" name="education" placeholder="e.g. PhD" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="languages">Languages Spoken</Label>
                    <Input id="languages" name="languages" placeholder="e.g. English, Arabic" />
                </div>
             </div>
          </div>
          
           {/* Section 5: Religion */}
           <div className="space-y-4">
             <h3 className="font-headline text-lg font-semibold border-b pb-2">Religion</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Input id="religion" name="religion" defaultValue="Islam" disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="denomination">Denomination / Sect</Label>
                    <Input id="denomination" name="denomination" placeholder="e.g. Sunni" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="polygamy">Accepts Polygamy</Label>
                    <Select name="polygamy">
                        <SelectTrigger id="polygamy"><SelectValue placeholder="Any" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
             </div>
           </div>

          {/* Section 6: Free Text */}
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-semibold border-b pb-2">Free Text Search</h3>
            <div className="space-y-2">
                <Label htmlFor="description">Describe him/her</Label>
                <Textarea id="description" name="description" placeholder="Search for keywords in user bios..." />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button size="lg" type="submit">
            <SearchIcon className="mr-2" />
            Search Now
        </Button>
      </CardFooter>
    </Card>
  )
}
